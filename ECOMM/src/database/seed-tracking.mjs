import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const master = new Pool({
    host: "127.0.0.1", port: 5432,
    user: "root", password: "root123",
    database: "identity_access_management_master"
});

const mc = await master.connect();
try {
    await mc.query(`
        CREATE TABLE IF NOT EXISTS master.migrations (
            id          BIGSERIAL    PRIMARY KEY,
            migration   VARCHAR(255) NOT NULL UNIQUE,
            batch       INT          NOT NULL,
            created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        )
    `);
    await mc.query(`
        INSERT INTO master.migrations (migration, batch) VALUES
            ('001_create_schema.sql', 1),
            ('002_tenants.sql', 1)
        ON CONFLICT (migration) DO NOTHING
    `);
    console.log("master.migrations seeded — existing tables recorded.");
} finally {
    mc.release();
    await master.end();
}
