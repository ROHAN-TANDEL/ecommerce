import { Pool, type PoolConfig } from "pg";
import { api } from "../routes/api.js";
import express from "express";

export default class Platform {

    private pools:any = new Map();

    config() : any
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

    connect(config:any) : any
    {
        const pools = new Map();
        const routerStore = [];
        for (const [productName, productDetail] of Object.entries(config))
        {
            const databases = Object.keys(productDetail['database']);

            for (const databaseRole of databases) {
                const databaseConfig : any = productDetail['database'][databaseRole];

                if (databaseConfig.status) {
                    const databaseCred : any = productDetail['database'][databaseRole]['credentials'];
                    let pool = this.newPool(productName, databaseRole, databaseCred);
                    let poolKey : any = `${productName}:${databaseRole}`;
                    pools.set(poolKey, pool);

                    if (databaseConfig.roles?.master === true) {
                        poolKey = `${productName}:master`;
                        pools.set(poolKey, pool);
                    }

                    if (databaseConfig.roles?.client === true) {
                        poolKey = `${productName}:client`;
                        pools.set(poolKey, pool);
                    }
                }

            }

            const routes:any = productDetail.routes;

            for (const routeName of routes)
            {
                const sample = {message:"hello"};
                const router = express.Router();
                const route = api[routeName];
                const registerRoute = (new route()).route(sample);
                router.use(productDetail.identification, registerRoute);
                routerStore.push(router);
            }
        }

        return [pools, routerStore];
    }

    newPool(productName:any, databaseRole:any, databaseCred:any): any
    {
        const pool = new Pool(databaseCred);

        return pool;
    }

    async closePools(poolsDetails:any)
    {
        const pools = Array.from(poolsDetails.values());

        await Promise.all(
            pools.map(pool => pool.end())
        );

        pools.clear();

        return true;
    }

    async connection(domain:any, databaseRole:any)
    {
        const pool = this.getPool(domain, databaseRole);

        return await pool.connect();
    }

    getPool(pools:any, productName:any, databaseRole:any):any
    {
        return pools.get(`${productName}:${databaseRole}`);
    }

    async client(pool:any)
    {
        return await pool.connect();
    }
}


export function preparePools()
{
    const platform = new Platform();
    const config : any = platform.config();
    const [pools, routers] = platform.connect(config);
    return [platform, pools, routers];
}

export function closePools(platform:any, pools:any)
{
    return platform.closePools(pools);
}

/**
 * explcite handling of pool connections
 *
 * @param platform
 * @param pools
 * @param productName
 * @param databaseRole
 */
export async function client(platform:any, pools:any, productName:any, databaseRole:any) : any
{
    if (databaseRole === undefined || databaseRole === null)
    {
        const masterPool = platform.getPool(pools, productName, 'master');
        const masterClient = await platform.client(masterPool);

        const clientPool = platform.getPool(pools, productName, 'client');
        const clientClient = await platform.client(clientPool);

        return {
            master : masterClient,
            client : clientClient
        };
    }

    const pool = platform.getPool(pools, productName, databaseRole);

    const client = await platform.client(pool);

    return client;
}

/**
 * pool borrow and release handled by pg package behind the scene
 *
 * @param platform
 * @param pools
 * @param productName
 * @param databaseRole
 */
export async function poolClient(platform:any, pools:any, productName:any, databaseRole?:any) : any
{
    if (databaseRole === undefined || databaseRole === null)
    {
        const master = platform.getPool(pools, productName, 'master');
        const client = platform.getPool(pools, productName, 'client');

        return {
            master : master,
            client : client
        };
    }

    const [pool] = platform.getPool(pools, productName, databaseRole);
    return pool;
}

// todo repeated pool reuqest for same product and client must return the same pool connection
