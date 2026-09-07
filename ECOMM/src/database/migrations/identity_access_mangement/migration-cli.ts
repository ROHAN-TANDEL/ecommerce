/**
 * db:migrate
 * Runs all pending migrations for both master and client databases.
 * Prerequisite: run db:setup first.
 */
import { Pool } from "pg";
import { MigrationRunner } from "./migration-runner.js";
import config from "./config/config.js";
import type { DbConfig } from "./config/config.js";

async function runMigrations(label: string, cfg: DbConfig): Promise<void> {
    console.log(`=== ${label} migrations ===`);

    const pool = new Pool({
        host:     cfg.host,
        port:     cfg.port,
        user:     cfg.user,
        password: cfg.password,
        database: cfg.database,
    });

    try {
        const runner = new MigrationRunner(pool, cfg.migrationsPath, cfg.schema);
        await runner.run();
    } finally {
        await pool.end();
    }
}

async function main(): Promise<void> {
    await runMigrations("Master", config.master);
    await runMigrations("Client", config.client);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
