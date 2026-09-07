/**
 * db:setup:client
 * Creates the client database, schema, and migrations tracking table.
 * Run this once before running db:migrate:client.
 */
import { setupDatabase } from "./db-setup.js";
import config from "./config/config.js";

console.log("=== Client DB setup ===");

setupDatabase(config.client)
    .then(() => console.log("=== Client setup complete ==="))
    .catch((err) => { console.error(err); process.exitCode = 1; });
