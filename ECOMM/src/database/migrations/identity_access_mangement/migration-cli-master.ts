/**
 * db:migrate:master
 * Runs all pending SQL migrations for the master database.
 * Prerequisite: run db:setup:master first.
 */
import { Pool } from "pg";
import { MigrationRunner } from "./migration-runner.js";
import config from "./config/config.js";

async function main(): Promise<void> {
    const cfg = config.master;

    console.log("=== Master migrations ===");

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

main().catch((err) => { console.error(err); process.exitCode = 1; });
