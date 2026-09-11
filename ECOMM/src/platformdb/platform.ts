import { Pool, type PoolConfig } from "pg";

export default class Platform {

    private pools:any;

    config() : any
    {
        return {
            authorization_management: {
                master: {
                    host : "localhost",
                    port : 5432,
                    database : "authorization_management_master",
                    schema : "master",
                    user : "root",
                    password : "root123",
                },

                client: {
                    host : "localhost",
                    port : 5432,
                    database : "authorization_management_client",
                    user : "root",
                    password : "root123",
                }
            },

            identity_access_management: {
                master: {
                    host : "localhost",
                    port : 5432,
                    database : "identity_access_management_master",
                    schema : "master",
                    user : "root",
                    password : "root123",
                },

                client: {
                    host : "localhost",
                    port : 5432,
                    database : "identity_access_management_client",
                    user : "root",
                    password : "root123",
                }
            }
        };
    }

    connect(config:any) : any
    {
        const pools = new Map();

        for (const [productName, productDetail] of Object.entries(config))
        {
            const databases = Object.keys(productDetail);

            for (const databaseRole of databases) {
                const databaseCred : any = productDetail[databaseRole];
                let pool = this.newPool(productName, databaseRole, databaseCred);
                let poolKey : any = `${productName}:${databaseRole}`;
                pools.set(poolKey, pool);
            }
        }

        return pools;ç
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

        this.pools.clear();

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
    const pools : any = platform.connect(config);
    return [platform, pools];
}

export function closePools(platform:any, pools:any)
{
    return platform.closePools(pools);
}

export async function client(platform:any, pools:any, productName:any, databaseRole:any)
{
    const pool = platform.getPool(pools, productName, databaseRole);
    const client = await platform.client(pool);
    return client;
}
