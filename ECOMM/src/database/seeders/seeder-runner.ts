import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import type { PoolClient } from "pg";

const SEEDERS_TABLE = "schema_seeders";

export class SeederRunner {
    constructor(
        private readonly pool: Pool,
        private readonly seedersPath: string
    ) {}

    async run(): Promise<void> {
        const client = await this.pool.connect();

        try {
            await this.createSeedersTable(client);

            const seeders = await this.loadSeeders();

            for (const seeder of seeders) {
                const applied = await this.isApplied(client, seeder.name);

                if (applied) {
                    console.log(`Skipping ${seeder.name}`);
                    continue;
                }

                await this.runSeeder(
                    client,
                    seeder.name,
                    seeder.sql
                );
            }

            console.log("Seeders completed.");
        } finally {
            client.release();
        }
    }

    private async createSeedersTable(
        client: PoolClient
    ): Promise<void> {
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${SEEDERS_TABLE} (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
    }

    private async loadSeeders(): Promise<
        { name: string; sql: string }[]
    > {
        const files = await fs.readdir(this.seedersPath);

        const seederFiles = files
            .filter((file) => file.endsWith(".sql"))
            .sort();

        const seeders: { name: string; sql: string }[] = [];

        for (const file of seederFiles) {
            const filePath = path.join(this.seedersPath, file);
            const sql = await fs.readFile(filePath, "utf8");

            seeders.push({
                name: file,
                sql,
            });
        }

        return seeders;
    }

    private async isApplied(
        client: PoolClient,
        seederName: string
    ): Promise<boolean> {
        const result = await client.query(
            `
                SELECT 1
                FROM ${SEEDERS_TABLE}
                WHERE name = $1
                LIMIT 1;
            `,
            [seederName]
        );

        return result.rowCount !== 0;
    }

    private async runSeeder(
        client: PoolClient,
        seederName: string,
        sql: string
    ): Promise<void> {
        console.log(`Running ${seederName}...`);

        await client.query("BEGIN");

        try {
            await client.query(sql);

            await client.query(
                `
                    INSERT INTO ${SEEDERS_TABLE} (name)
                    VALUES ($1);
                `,
                [seederName]
            );

            await client.query("COMMIT");

            console.log(`Completed ${seederName}`);
        } catch (error) {
            await client.query("ROLLBACK");

            console.error(`Failed ${seederName}`);

            throw error;
        }
    }
}