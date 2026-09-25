import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

export class MigrationRunner {
    /**
     * @param pool            - connected pool for the target database
     * @param migrationsPath  - absolute path to the folder containing .sql files
     * @param schema          - schema that owns the migrations tracking table
     *                          e.g. "master_im" or "client_im"
     */
    constructor(
        private readonly pool: Pool,
        private readonly migrationsPath: string,
        private readonly schema: string
    ) {}

    // fully-qualified migrations table, e.g. master_im.migrations
    private get table(): string {
        return `${this.schema}.migrations`;
    }

    async run(): Promise<void> {
        // The schema itself is created by the first SQL migration (001_create_schema.sql).
        // We ensure the tracking table exists before anything else.
        await this.ensureMigrationsTable();

        const pending = await this.loadPending();

        if (pending.length === 0) {
            console.log("  [info] Nothing to migrate.");
            return;
        }

        // All pending files in this run share the same batch number
        const batch = await this.nextBatch();

        for (const migration of pending) {
            await this.applyMigration(migration.name, migration.sql, batch);
        }

        console.log("[migrations] All done.");
    }

    // ── private ────────────────────────────────────────────────────────────

    private async ensureMigrationsTable(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${this.table} (
                    id          BIGSERIAL    PRIMARY KEY,
                    migration   VARCHAR(255) NOT NULL UNIQUE,
                    batch       INT          NOT NULL,
                    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
                );
            `);
        } finally {
            client.release();
        }
    }

    private async nextBatch(): Promise<number> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `SELECT COALESCE(MAX(batch), 0) + 1 AS next_batch FROM ${this.table}`
            );
            return Number(result.rows[0].next_batch);
        } finally {
            client.release();
        }
    }

    private async loadPending(): Promise<{ name: string; sql: string }[]> {
        const files = await fs.readdir(this.migrationsPath);

        const sqlFiles = files
            .filter((f) => f.endsWith(".sql"))
            .sort();

        const pending: { name: string; sql: string }[] = [];

        for (const file of sqlFiles) {
            if (await this.isApplied(file)) {
                console.log(`  [skip] ${file}`);
                continue;
            }
            const sql = await fs.readFile(path.join(this.migrationsPath, file), "utf8");
            pending.push({ name: file, sql });
        }

        return pending;
    }

    private async isApplied(migrationName: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `SELECT 1 FROM ${this.table} WHERE migration = $1 LIMIT 1`,
                [migrationName]
            );
            return (result.rowCount ?? 0) > 0;
        } finally {
            client.release();
        }
    }

    private async applyMigration(name: string, sql: string, batch: number): Promise<void> {
        console.log(`  [run]  ${name} ...`);

        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query(
                `INSERT INTO ${this.table} (migration, batch) VALUES ($1, $2)`,
                [name, batch]
            );
            await client.query("COMMIT");
            console.log(`  [ok]   ${name}`);
        } catch (err) {
            await client.query("ROLLBACK").catch(() => {});
            console.error(`  [fail] ${name}`);
            throw err;
        } finally {
            client.release();
        }
    }
}
