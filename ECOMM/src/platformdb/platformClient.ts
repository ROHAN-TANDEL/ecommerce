import { Pool, type PoolConfig } from "pg";
import { api } from "../routes/api.js";
import express from "express";

export default class PlatformClient {

    private poolsMap : any = new Map();

    constructor() {
        const config = this.config();
        this.setPools(config);
    }

    private pools:any = new Map();

    private config() : any
    {
        return {
            authorization_management: {
                routes : ["TenantRoute"],
                identification : '/identity/management',
                database : {
                    master: {
                        status : true,
                        roles : { master : true },
                        credentials : {
                            host : "localhost",
                            port : 5432,
                            database : "authorization_management_master",
                            schema : "master",
                            user : "root",
                            password : "root123"
                        }
                    },

                    client: {
                        status : true,
                        roles : { client : true },
                        credentials : {
                            host: "localhost",
                            port: 5432,
                            database: "authorization_management_client",
                            user: "root",
                            password: "root123",
                        }
                    }
                }
            },

            identity_access_management: {
                routes : ["TenantRoute"],
                identification : '/identity/management',
                database : {
                    master: {
                        status : true,
                        roles : { master : true },
                        credentials : {
                            host: "localhost",
                            port: 5432,
                            database: "identity_access_management_master",
                            schema: "master",
                            user: "root",
                            password: "root123",
                        }
                    },

                    client: {
                        status: true,
                        roles : { client : true },
                        credentials: {
                            host: "localhost",
                            port: 5432,
                            database: "identity_access_management_client",
                            user: "root",
                            password: "root123",
                        }
                    }
                }
            }
        };
    }

    private setPools(config:any) : any
    {
        for (const [productName, productDetail] of Object.entries(config))
        {
            const databases = Object.keys(productDetail['database']);

            for (const databaseRole of databases) {
                const databaseConfig : any = productDetail['database'][databaseRole];

                if (databaseConfig.status) {

                    const databaseCred : any = productDetail['database'][databaseRole]['credentials'];

                    const { schema, ...credentials } = databaseCred;


                    const pool: any = new Pool({
                        ...credentials,
                        options: schema ? `-c search_path=${schema}` : undefined
                    });

                    let poolKey : any = `${productName}:${databaseRole}`;

                    this.poolsMap.set(poolKey, pool);

                    if (databaseConfig.roles?.client === true) {
                        poolKey = `${productName}:client`;
                        this.poolsMap.set(poolKey, pool);
                    }
                }
            }
        }

        return this.poolsMap;
    }

    getPools()
    {
        return this.poolsMap;
    }

    async closePools()
    {
        const pools = Array.from(this.poolsMap.values());

        await Promise.all(
            pools.map(pool => pool.end())
        );

        pools.clear();

        return true;
    }
}

