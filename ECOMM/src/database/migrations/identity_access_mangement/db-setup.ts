/**
 * Shared setup utility.
 * Does three things — in order — for a given database:
 *   1. Create the database     (connects via postgres maintenance db)
 *   2. Create the schema       (connects to the target database)
 *   3. Create migrations table (inside that schema)
 *
 * Safe to re-run — every step is idempotent.
 */
import { Pool } from "pg";
import type { DbConfig } from "./config/config.js";

export async function setupDatabase(cfg: DbConfig): Promise<void> {

    // ── 1. Create database ────────────────────────────────────────────────
    const maintenancePool = new Pool({
        host:     cfg.host,
        port:     cfg.port,
        user:     cfg.user,
        password: cfg.password,
        database: "postgres",
    });

    try {
        const client = await maintenancePool.connect();
        try {
            const res = await client.query(
                "SELECT 1 FROM pg_database WHERE datname = $1",
                [cfg.database]
            );
            if ((res.rowCount ?? 0) === 0) {
                await client.query(`CREATE DATABASE "${cfg.database}"`);
                console.log(`  [setup] Database "${cfg.database}" created.`);
            } else {
                console.log(`  [setup] Database "${cfg.database}" already exists.`);
            }
        } finally {
            client.release();
        }
    } finally {
        await maintenancePool.end();
    }

    // ── 2. Create schema + 3. Create migrations table ────────────────────
    const dbPool = new Pool({
        host:     cfg.host,
        port:     cfg.port,
        user:     cfg.user,
        password: cfg.password,
        database: cfg.database,
    });

    try {
        const client = await dbPool.connect();
        try {
            // schema
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${cfg.schema}"`);
            console.log(`  [setup] Schema "${cfg.schema}" ready.`);

            // migrations tracking table lives inside the schema
            await client.query(`
                CREATE TABLE IF NOT EXISTS "${cfg.schema}".migrations (
                    id          BIGSERIAL    PRIMARY KEY,
                    migration   VARCHAR(255) NOT NULL UNIQUE,
                    batch       INT          NOT NULL,
                    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
                )
            `);
            console.log(`  [setup] "${cfg.schema}".migrations table ready.`);
        } finally {
            client.release();
        }
    } finally {
        await dbPool.end();
    }
}
