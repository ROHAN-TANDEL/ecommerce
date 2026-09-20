import { Pool, type PoolConfig } from "pg";
import Wrapper from "./wrapper.js";
import Config from "./config.js";

export default class Platform {

    private poolsMap : any = new Map();

    constructor() {
        const config = this.config();
        this.setPools(config);
    }

    private pools:any = new Map();

    private config() : any
    {
        return new Config().config();
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

                    // reason - we need schema level connections borrowed from pool thus we need client pool created for once at start
                    // if (databaseConfig?.schema_separation === true) { continue; }

                    const [poolKey, pool] = this.connectPool(productName, databaseRole, credentials, schema, databaseConfig);

                    this.poolsMap.set(poolKey, pool);
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
            pools.map((pool:any) => pool.end())
        );

        this.poolsMap.clear();

        return true;
    }

    private connectPool(productName, databaseRole, credentials, schema, databaseConfig)
    {
        const pool: any = new Pool({
            ...credentials,
            options: schema
                ? `-c search_path=${schema}`
                : undefined
        });


        let poolKey : any = `${productName}:${databaseRole}`;

        if (databaseConfig.roles?.master === true) {
            poolKey = `${productName}:master`;
            return [poolKey, pool];
        }

        if (databaseConfig.roles?.client === true) {
            poolKey = `${productName}:client`;
            const poolWrapper = new Wrapper(pool);
            return [poolKey, poolWrapper];
        }

        return [poolKey, pool];
    }
}

