import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const IAM_BASE = path.join(
    process.cwd(),
    "src",
    "database",
    "migrations",
    "identity_access_mangement"
);

export interface DbConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    schema: string;
    migrationsPath: string;
}

export interface MigrationConfig {
    master: DbConfig;
    client: DbConfig;
}

const config: MigrationConfig = {
    master: {
        host:           process.env.PG_MASTER_HOST         ?? "127.0.0.1",
        port:           Number(process.env.PG_MASTER_PORT  ?? 5432),
        user:           process.env.PG_MASTER_USERNAME     ?? "root",
        password:       process.env.PG_MASTER_PASSWORD     ?? "",
        database:       process.env.PG_IAM_MASTER_DATABASE ?? "identity_access_management_master",
        schema:         process.env.PG_IAM_MASTER_SCHEMA   ?? "master",
        migrationsPath: path.join(IAM_BASE, "master"),
    },
    client: {
        host:           process.env.PG_MASTER_HOST         ?? "127.0.0.1",
        port:           Number(process.env.PG_MASTER_PORT  ?? 5432),
        user:           process.env.PG_MASTER_USERNAME     ?? "root",
        password:       process.env.PG_MASTER_PASSWORD     ?? "",
        database:       process.env.PG_IAM_CLIENT_DATABASE ?? "identity_access_management_client",
        schema:         process.env.PG_IAM_CLIENT_SCHEMA   ?? "client_im",
        migrationsPath: path.join(IAM_BASE, "client"),
    },
};

export default config;
