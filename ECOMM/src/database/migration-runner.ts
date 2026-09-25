import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import type { PoolClient } from 'pg';

const MIGRATIONS_TABLE = "schema_migrations";

export class MigrationRunner {
    constructor(
        private readonly pool: Pool,
        private readonly migrationsPath: string
    ) {}

    async run(): Promise<void> {
        const client = await this.pool.connect();

        try {
            await this.createMigrationsTable(client);

            const migrations = await this.loadMigrations();

            for (const migration of migrations) {
                const applied = await this.isApplied(client, migration.name);

                if (applied) {
                    console.log(`Skipping ${migration.name}`);
                    continue;
                }

                await this.runMigration(client, migration.name, migration.sql);
            }

            console.log("Migrations completed.");
        } finally {
            client.release();
        }
    }

    private async createMigrationsTable(
        client: PoolClient
    ): Promise<void> {
        await client.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }

    private async loadMigrations(): Promise<
        { name: string; sql: string }[]
    > {
        const files = await fs.readdir(this.migrationsPath);

        const migrationFiles = files
            .filter((file) => file.endsWith(".sql"))
            .sort();

        const migrations = [];

        for (const file of migrationFiles) {
            const filePath = path.join(this.migrationsPath, file);
            const sql = await fs.readFile(filePath, "utf8");

            migrations.push({
                name: file,
                sql,
            });
        }

        return migrations;
    }

    private async isApplied(
        client: PoolClient,
        migrationName: string
    ): Promise<boolean> {
        const result = await client.query(
            `
        SELECT 1
        FROM ${MIGRATIONS_TABLE}
        WHERE name = $1
        LIMIT 1;
      `,
            [migrationName]
        );

        return result.rowCount !== 0;
    }

    private async runMigration(
        client: PoolClient,
        migrationName: string,
        sql: string
    ): Promise<void> {
        console.log(`Running ${migrationName}...`);

        await client.query("BEGIN");

        try {
            await client.query(sql);

            await client.query(
                `
          INSERT INTO ${MIGRATIONS_TABLE} (name)
          VALUES ($1);
        `,
                [migrationName]
            );

            await client.query("COMMIT");

            console.log(`Completed ${migrationName}`);
        } catch (error) {
            await client.query("ROLLBACK");

            console.error(`Failed ${migrationName}`);

            throw error;
        }
    }
}