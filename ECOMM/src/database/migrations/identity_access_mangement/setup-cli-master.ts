/**
 * db:setup:master
 * Creates the master database, schema, and migrations tracking table.
 * Run this once before running db:migrate:master.
 */
import { setupDatabase } from "./db-setup.js";
import config from "./config/config.js";

console.log("=== Master DB setup ===");

setupDatabase(config.master)
    .then(() => console.log("=== Master setup complete ==="))
    .catch((err) => { console.error(err); process.exitCode = 1; });
