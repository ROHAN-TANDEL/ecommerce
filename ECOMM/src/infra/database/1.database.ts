import { Pool, PoolConfig, PoolClient } from "pg";
import type {DomainDatabaseConfiguration} from "./1.database.js";


export type DatabaseRole = "master" | "client";


export type DatabaseDefinition = PoolConfig & {
    schema?: string;
};


export type DatabasePair = {
    master: DatabaseDefinition;
    client: DatabaseDefinition;
};

export type DomainDatabaseConfiguration = {

    status: boolean;

    master: boolean;

    client: boolean;

    connectClientSchema: boolean;

    databases: {

        master?: DatabaseDefinition;

        client?: DatabaseDefinition;

    };

};

export type DatabaseConfiguration = {

    products: string[];

    domains: {

        [domain: string]:
            DomainDatabaseConfiguration;

    };

};

const databaseConfiguration: DatabaseConfiguration = {

    products: [

        "identity_access_management",

        "subscription_management"

    ],


    domains: {

        identity_access_management: {

            status: true,

            master: true,

            client: true,

            connectClientSchema: true,


            databases: {

                master: {

                    host: process.env.PG_MASTER_HOST,

                    port: Number(
                        process.env.PG_MASTER_PORT ?? 5432
                    ),

                    user:
                    process.env.PG_MASTER_USERNAME,

                    password:
                    process.env.PG_MASTER_PASSWORD,

                    database:
                        "identity_access_management_master"

                },


                client: {

                    host: process.env.PG_CLIENT_HOST,

                    port: Number(
                        process.env.PG_CLIENT_PORT ?? 5432
                    ),

                    user:
                    process.env.PG_CLIENT_USERNAME,

                    password:
                    process.env.PG_CLIENT_PASSWORD,

                    database:
                        "identity_access_management_client"

                }

            }

        },


        subscription_management: {

            status: true,

            master: true,

            client: true,

            connectClientSchema: true,


            databases: {

                master: {

                    host: process.env.PG_MASTER_HOST,

                    port: Number(
                        process.env.PG_MASTER_PORT ?? 5432
                    ),

                    user:
                    process.env.PG_MASTER_USERNAME,

                    password:
                    process.env.PG_MASTER_PASSWORD,

                    database:
                        "subscription_management_master"

                },


                client: {

                    host: process.env.PG_CLIENT_HOST,

                    port: Number(
                        process.env.PG_CLIENT_PORT ?? 5432
                    ),

                    user:
                    process.env.PG_CLIENT_USERNAME,

                    password:
                    process.env.PG_CLIENT_PASSWORD,

                    database:
                        "subscription_management_client"

                }

            }

        }

    }

};

export type DomainRegistration = {
    domain: string;
    master?: boolean;
    client?: boolean;
};


export class DatabaseDomain {


    private readonly configuration:
        DatabaseConfiguration;

    private readonly registrations =
        new Map<
            string,
            Set<DatabaseRole>
        >();

    private readonly pools =
        new Map<string, Pool>();


    constructor(
        configuration: DatabaseConfiguration
    ) {

        this.configuration =
            configuration;

        this.initializeDomains();

    }

    // constructor(
    //     private readonly database: Database,
    //     private readonly domainName: string
    // ) {}

    private ensureRoleAllowed(
        domain: string,
        role: DatabaseRole
    ): void {

        const roles =
            this.registrations.get(domain);

        if (!roles) {

            throw new Error(
                `Database domain is not available: ${domain}`
            );

        }

        if (!roles.has(role)) {

            throw new Error(
                `Database role ${role} is not enabled for domain ${domain}`
            );

        }

    }



    private initializeDomains(): void {

        for (
            const domainName
            of this.configuration.products
            ) {

            const domain =
                this.configuration
                    .domains[domainName];


            if (!domain) {

                throw new Error(
                    `Database configuration missing for domain: ${domainName}`
                );

            }


            /*
             * Disabled domains are not initialized.
             */

            if (!domain.status) {

                continue;

            }


            const roles =
                new Set<DatabaseRole>();


            if (domain.master) {

                if (!domain.databases.master) {

                    throw new Error(
                        `Master database configuration missing for domain: ${domainName}`
                    );

                }

                roles.add("master");

            }


            if (domain.client) {

                if (!domain.databases.client) {

                    throw new Error(
                        `Client database configuration missing for domain: ${domainName}`
                    );

                }

                roles.add("client");

            }


            /*
             * At least one database role must exist
             * for an enabled domain.
             */

            if (roles.size === 0) {

                throw new Error(
                    `Enabled domain has no database roles: ${domainName}`
                );

            }


            this.registrations.set(
                domainName,
                roles
            );

        }

    }


    public master(): Pool {

        return this.database.getPool(
            this.domainName,
            "master"
        );
    }


    public client(): Pool {

        return this.database.getPool(
            this.domainName,
            "client"
        );
    }


    public async masterConnection(): Promise<PoolClient> {

        return await this.database.getConnection(
            this.domainName,
            "master"
        );
    }


    public async clientConnection(): Promise<PoolClient> {

        return await this.database.getConnection(
            this.domainName,
            "client"
        );
    }
}


export class Database {

    private readonly configuration: DatabaseConfiguration;

    private readonly registrations = new Map<
        string,
        Set<DatabaseRole>
    >();

    private readonly pools = new Map<string, Pool>();


    constructor(
        configuration: DatabaseConfiguration
    ) {
        this.configuration = configuration;
    }


    public registerDomain(
        registration: DomainRegistration
    ): void {

        const {
            domain,
            master = false,
            client = false
        } = registration;

        if (!this.configuration[domain]) {
            throw new Error(
                `Database configuration not found for domain: ${domain}`
            );
        }

        if (!master && !client) {
            throw new Error(
                `Domain ${domain} must have at least one database role registered`
            );
        }

        const roles = new Set<DatabaseRole>();

        if (master) {
            roles.add("master");
        }

        if (client) {
            roles.add("client");
        }

        this.registrations.set(
            domain,
            roles
        );

        return new DatabaseDomain(
            this,
            domain
        );
    }


    public domain(
        domain: string
    ): DatabaseDomain {

        if (!this.registrations.has(domain)) {
            throw new Error(
                `Database domain is not registered: ${domain}`
            );
        }

        return new DatabaseDomain(
            this,
            domain
        );
    }


    private isRoleAllowed(
        domain: string,
        role: DatabaseRole
    ): boolean {

        const roles = this.registrations.get(domain);

        if (!roles) {
            return false;
        }

        return roles.has(role);
    }


    private getPoolKey(
        domain: string,
        role: DatabaseRole
    ): string {

        return `${domain}:${role}`;
    }


    public getPool(
        domain: string,
        role: DatabaseRole
    ): Pool {

        this.ensureRoleAllowed(
            domain,
            role
        );

        const poolKey =
            this.getPoolKey(
                domain,
                role
            );

        const existingPool =
            this.pools.get(poolKey);

        if (existingPool) {

            return existingPool;

        }

        const database =
            this.configuration
                .domains[domain]
                ?.databases[role];

        if (!database) {

            throw new Error(
                `Database configuration missing for ${domain}:${role}`
            );

        }

        const pool =
            new Pool(database);

        this.pools.set(
            poolKey,
            pool
        );

        return pool;

    }


    public async getConnection(
        domain: string,
        role: DatabaseRole
    ): Promise<PoolClient> {

        const pool = this.getPool(
            domain,
            role
        );

        return await pool.connect();
    }


    public async closeAll(): Promise<void> {

        const pools = Array.from(
            this.pools.values()
        );

        await Promise.all(
            pools.map(pool => pool.end())
        );

        this.pools.clear();
    }
}

export class ApiRegistry {

    private readonly apis =
        new Map<
            string,
            ApiRegistration
        >();


    constructor(
        private readonly database: Database
    ) {}


    public register(
        api: ApiRegistration
    ): void {

        if (
            this.apis.has(api.id)
        ) {

            throw new Error(
                `API already registered: ${api.id}`
            );

        }


        /*
         * Ensure the API domain exists
         * and is available.
         */

        this.database.domain(
            api.domain
        );


        this.apis.set(
            api.id,
            api
        );

    }


    public get(
        apiId: string
    ): ApiRegistration {

        const api =
            this.apis.get(apiId);

        if (!api) {

            throw new Error(
                `API not registered: ${apiId}`
            );

        }

        return api;

    }

}