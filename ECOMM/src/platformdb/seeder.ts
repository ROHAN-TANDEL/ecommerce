import Config from "./config.js";
import { Pool } from "pg";
import {SeederRunner} from "../database/seeder-runner.js";

export class MasterSeeder {

    config()
    {
        return new Config().config();
    }

    async execute(product:any, dbRole:any, schema:any) : any
    {
        const config = this.config();

        for (const [productName, productDetail] of Object.entries(config))
        {
            const databases = Object.keys(productDetail['database']);

            for (const databaseRole of databases) {

                const databaseConfig : any = productDetail['database'][databaseRole];

                if (databaseConfig.status) {

                    if (databaseConfig?.migration?.enabled === true
                        && product === productName
                        && databaseRole === dbRole) {

                            const pool:any = this.connect( databaseConfig.credentials );

                            try {
                                await this.migrate(pool, schema, databaseConfig.seeder.path.at(0));
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

    async migrate(pool:any, schema:any, migrationsPath:any) : Promise<any>
    {
        await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        await pool.query(`SET search_path TO ${schema}`);

        const runner:any = new SeederRunner(pool, migrationsPath);

        await runner.run().catch((error) => {
                console.error(error);
                process.exitCode = 1;
            });
    }
}
