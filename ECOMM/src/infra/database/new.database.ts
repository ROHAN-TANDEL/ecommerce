import { Pool, PoolConfig, PoolClient } from "pg";


export type DatabaseRole = "master" | "client";


export type DatabaseDefinition = PoolConfig & {
    schema?: string;
};


export type DatabasePair = {
    master: DatabaseDefinition;
    client: DatabaseDefinition;
};


export type DatabaseConfiguration = {
    [domain: string]: DatabasePair;
};


export type DomainRegistration = {
    domain: string;
    master?: boolean;
    client?: boolean;
};


export class DatabaseDomain {

    constructor(
        private readonly database: Database,
        private readonly domainName: string
    ) {}


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
    ): DatabaseDomain {

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


    private isRoleAllowed(
        domain: string,
        role: DatabaseRole
    ): boolean {

        const roles = this.registrations.get(
            domain
        );

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

        if (!this.isRoleAllowed(domain, role)) {
            throw new Error(
                `Database role ${role} is not allowed for domain ${domain}`
            );
        }

        const poolKey =
            this.getPoolKey(domain, role);

        const existingPool =
            this.pools.get(poolKey);

        if (existingPool) {
            return existingPool;
        }

        const database =
            this.configuration[domain]?.[role];

        if (!database) {
            throw new Error(
                `Database configuration not found for ${domain}:${role}`
            );
        }

        const pool = new Pool(
            database
        );

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

        const pools =
            Array.from(this.pools.values());

        await Promise.all(
            pools.map(pool => pool.end())
        );

        this.pools.clear();
    }
}