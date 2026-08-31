import path from "node:path";
import { Pool } from "pg";
import { MigrationRunner } from "./migration-runner.js";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

console.log(process.env);

const migrationsPath = path.join(
    process.cwd(),
    "src",
    "database",
    "migrations"
);

const runner = new MigrationRunner(
    pool,
    migrationsPath
);

runner
    .run()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });