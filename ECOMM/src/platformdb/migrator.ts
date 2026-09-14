import Config from "./config.js";
import express from "express";
import {api} from "../routes/api.js";
import clientContext from "./request-context-middleware.js";
import {MigrationRunner} from "../database/migration-runner.js";
import { Pool, type PoolConfig } from "pg";

export class MasterMigrate {

    config()
    {
        return new Config().config();
    }

    async execute(product:any, dbRole:any) : any
    {
        const config = this.config();

        for (const [productName, productDetail] of Object.entries(config))
        {
            const databases = Object.keys(productDetail['database']);
            const dbs = {};

            for (const databaseRole of databases) {

                let poolKey;

                const databaseConfig : any = productDetail['database'][databaseRole];

                if (databaseConfig.status) {

                    if (databaseConfig.roles?.master !== true && databaseConfig.roles?.client !== true) {
                        poolKey = `${productName}:${databaseRole}`;
                        dbs[databaseRole] = this.pools.get(poolKey);
                    }

                    if (databaseConfig.roles?.master === true
                        && databaseConfig?.migration?.enabled === true
                        && product === productName
                        && databaseRole === dbRole) {

                            const pool:any = this.connect( databaseConfig.credentials );

                            try {
                                await this.migrate(pool, databaseConfig.migration.path.at(0));
                            } finally {
                               await pool.end();
                            }
                            break;
                    }
                }
            }
        }
    }

    connect(credentials:any)
    {
        const { schema, ...databaseCredentials } = credentials;

        return new Pool(databaseCredentials);
    }

    async migrate(pool:any, migrationsPath:any) : Promise<any>
    {
        await pool.query(`CREATE SCHEMA IF NOT EXISTS master`);
        await pool.query(`SET search_path TO master`);

        const runner:any = new MigrationRunner(pool, migrationsPath);

        await runner.run().catch((error) => {
                console.error(error);
                process.exitCode = 1;
            });
    }
}
