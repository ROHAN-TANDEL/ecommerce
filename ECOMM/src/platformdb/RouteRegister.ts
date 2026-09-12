import { Pool, type PoolConfig } from "pg";
import { api } from "../routes/api.js";
import express from "express";

export default class RouteRegister {

    private routers:any = [];

    constructor(private readonly pools:any) {
        const config = this.config();
        this.register(config);
    }

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
                            password : "root123",
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

    private register(config:any) : any
    {

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

                    if (databaseConfig.roles?.master === true) {
                        poolKey = `${productName}:master`;
                        dbs['master'] = this.pools.get(poolKey);
                    }

                    if (databaseConfig.roles?.client === true) {
                        poolKey = `${productName}:client`;
                        dbs['client'] = this.pools.get(poolKey);
                    }
                }
            }

            const routes:any = productDetail.routes;

            for (const routeName of routes)
            {
                const router = express.Router();

                const routerName = api[routeName];

                const registerRoute = (new routerName()).route(dbs);

                router.use(productDetail.identification, registerRoute);

                this.routers.push(router);
            }
        }
        return this.routers;
    }

    public routes()
    {
        return this.routers;
    }
}