import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const CLIENT_MIGRATIONS_PATH = path.join(
    process.cwd(),
    "src",
    "database",
    "migrations",
    "identity_access_mangement",
    "client"
);

/**
 * Provisions a brand-new schema inside the client database for a tenant.
 *
 * Steps:
 *  1. Create schema  tenant_<id>
 *  2. Create         tenant_<id>.migrations  tracking table
 *  3. Run all SQL files from the client migrations folder,
 *     replacing the "client" schema placeholder with the real schema name
 */
export class TenantProvisioner {

    private readonly clientPool: Pool;

    constructor(private readonly context: any) {
        // Dedicated pool for the client database — separate from the master pool
        this.clientPool = new Pool({
            host:     context.env.PG_MASTER_HOST,
            port:     Number(context.env.PG_MASTER_PORT ?? 5432),
            user:     context.env.PG_MASTER_USERNAME,
            password: context.env.PG_MASTER_PASSWORD,
            database: context.env.PG_IAM_CLIENT_DATABASE ?? "identity_access_management_client",
        });
    }

    async provision(tenantId: number): Promise<void> {
        const schema = `tenant_${tenantId}`;

        await this.createSchema(schema);
        await this.createMigrationsTable(schema);
        await this.runMigrations(schema);
    }

    async close(): Promise<void> {
        await this.clientPool.end();
    }

    // ── private ─────────────────────────────────────────────────────────────

    private async createSchema(schema: string): Promise<void> {
        const client = await this.clientPool.connect();
        try {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        } finally {
            client.release();
        }
    }

    private async createMigrationsTable(schema: string): Promise<void> {
        const client = await this.clientPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS "${schema}".migrations (
                    id          BIGSERIAL    PRIMARY KEY,
                    migration   VARCHAR(255) NOT NULL UNIQUE,
                    batch       INT          NOT NULL,
                    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
                )
            `);
        } finally {
            client.release();
        }
    }

    private async runMigrations(schema: string): Promise<void> {
        const files = await fs.readdir(CLIENT_MIGRATIONS_PATH);
        const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

        for (const file of sqlFiles) {
            const raw = await fs.readFile(path.join(CLIENT_MIGRATIONS_PATH, file), "utf8");

            // Replace the "client" schema placeholder with the real tenant schema.
            // SQL files use "client" as the schema name in CREATE TABLE statements.
            const sql = raw.replace(/\bclient\b\./g, `"${schema}".`);

            const client = await this.clientPool.connect();
            try {
                await client.query("BEGIN");
                await client.query(sql);
                await client.query(
                    `INSERT INTO "${schema}".migrations (migration, batch) VALUES ($1, 1)`,
                    [file]
                );
                await client.query("COMMIT");
            } catch (err) {
                await client.query("ROLLBACK").catch(() => {});
                throw err;
            } finally {
                client.release();
            }
        }
    }
}
