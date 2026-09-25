import Config from "./config.js";
import { Pool } from "pg";

export class SchemaManager {

    config()
    {
        return new Config().config();
    }

    async create(product:any, schema:any)
    {
        const config:any = this.config();

        const databaseConfig:any =
            config[product]?.database?.client;

        if (!databaseConfig?.status ||
            databaseConfig?.schema_separation !== true) {
            return false;
        }

        const pool:any = this.connect(
            databaseConfig.credentials
        );

        try {
            await pool.query(
                `CREATE SCHEMA IF NOT EXISTS "${schema}"`
            );

            return schema;
        }
        finally {
            await pool.end();
        }
    }

    connect(credentials:any)
    {
        const { schema, ...databaseCredentials } = credentials;

        return new Pool(databaseCredentials);
    }
}