import path from "node:path";
import { Pool } from "pg";
import { SeederRunner } from "./seeder-runner.js";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seedersPath = path.join(
    process.cwd(),
    "src",
    "database",
    "seeders"
);

const runner = new SeederRunner(
    pool,
    seedersPath
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