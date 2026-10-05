// src/platform/core/connection-manager.ts

import { Pool, type PoolClient, type PoolConfig } from 'pg';
import type { DatabaseConnectionConfig, DomainConfig } from './types.js';

export class ConnectionManager {
    private readonly pools = new Map<string, Pool>();
    private readonly domainConfigs = new Map<string, DomainConfig>();

    constructor() {
        // Parse domain configs from environment
        this.loadDomainConfigs();
    }

    /**
     * Load domain configurations from environment
     */
    private loadDomainConfigs(): void {
        const domains = this.getDomainNames();

        for (const domain of domains) {
            const prefix = `DOMAIN_${domain.toUpperCase()}_`;

            const config: DomainConfig = {
                name: domain,
                status: process.env[`${prefix}STATUS`] !== 'false',
                strategy: (process.env[`${prefix}STRATEGY`] || 'multi_db') as any,
                masterDb: process.env[`${prefix}MASTER_DB`] || `${domain}_master`,
                clientDb: process.env[`${prefix}CLIENT_DB`],
                readDb: process.env[`${prefix}READ_DB`],
                writeDb: process.env[`${prefix}WRITE_DB`],
                tenant: {
                    enabled: process.env[`${prefix}TENANT_ENABLED`] !== 'false',
                    headerName: process.env[`${prefix}TENANT_HEADER`] || 'x-tenant-id'
                }
            };

            this.domainConfigs.set(domain, config);
            console.log(`{ success ::   Domain loaded: ${domain}}`);
            console.log(`{ success ::   Master DB: ${config.masterDb}}`);
            console.log(`{ success ::   Client DB: ${config.clientDb || 'None'}}`);
        }
    }

    /**
     * Get all domain names from environment
     */
    private getDomainNames(): string[] {
        const names: string[] = [];
        const prefix = 'DOMAIN_';
        const suffix = '_STATUS';

        for (const key of Object.keys(process.env)) {
            if (key.startsWith(prefix) && key.endsWith(suffix)) {
                const name = key.slice(prefix.length, -suffix.length).toLowerCase();
                names.push(name);
            }
        }

        return names;
    }

    /**
     * Get domain configuration
     */
    getDomainConfig(domain: string): DomainConfig {
        const config = this.domainConfigs.get(domain);
        if (!config) {
            throw new Error(`Domain not configured: ${domain}`);
        }
        return config;
    }

    /**
     * Get all domains
     */
    getDomains(): string[] {
        return Array.from(this.domainConfigs.keys());
    }

    /**
     * Get a connection pool for a database
     */
    getDatabasePool(dbName: string): Pool {
        const poolKey = `db:${dbName}`;
        const existing = this.pools.get(poolKey);
        if (existing) {
            return existing;
        }

        const config = this.getDatabaseConfig(dbName);
        const pool = this.createPool(config, dbName);
        this.pools.set(poolKey, pool);
        return pool;
    }

    /**
     * Get pool for domain's master database
     */
    getMasterPool(domain: string): Pool {
        const config = this.getDomainConfig(domain);
        return this.getDatabasePool(config.masterDb);
    }

    /**
     * Get pool for domain's client database
     */
    getClientPool(domain: string): Pool | null {
        const config = this.getDomainConfig(domain);
        if (!config.clientDb) {
            return null;
        }
        return this.getDatabasePool(config.clientDb);
    }

    /**
     * Get master client connection (borrow, MUST release)
     */
    async getMasterClient(domain: string): Promise<PoolClient> {
        const pool = this.getMasterPool(domain);
        return pool.connect();
    }

    /**
     * Get client client connection (borrow, MUST release)
     */
    async getClientClient(domain: string): Promise<PoolClient | null> {
        const pool = this.getClientPool(domain);
        if (!pool) {
            return null;
        }
        return pool.connect();
    }

    /**
     * Execute a query on master database
     */
    async queryMaster(domain: string, text: string, params?: any[]): Promise<any> {
        const client = await this.getMasterClient(domain);
        try {
            return await client.query(text, params);
        } finally {
            client.release();
        }
    }

    /**
     * Execute a query on client database
     */
    async queryClient(domain: string, text: string, params?: any[]): Promise<any> {
        const client = await this.getClientClient(domain);
        if (!client) {
            throw new Error(`No client database configured for ${domain}`);
        }
        try {
            return await client.query(text, params);
        } finally {
            client.release();
        }
    }

    /**
     * Get database configuration from environment
     */
    private getDatabaseConfig(dbName: string): DatabaseConnectionConfig {
        const prefix = `DB_${dbName.toUpperCase()}_`;

        return {
            host: process.env[`${prefix}HOST`] || '127.0.0.1',
            port: Number(process.env[`${prefix}PORT`] || 5432),
            user: process.env[`${prefix}USERNAME`] || 'root',
            password: process.env[`${prefix}PASSWORD`] || '',
            database: process.env[`${prefix}DATABASE`] || dbName,
            ssl: process.env[`${prefix}SSL`] === 'true',
            connectionTimeoutMillis: Number(process.env[`${prefix}CONNECTION_TIMEOUT`] || 5000)
        };
    }

    /**
     * Create a PostgreSQL pool
     */
    private createPool(config: DatabaseConnectionConfig, dbName: string): Pool {
        const poolConfig: PoolConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            ssl: config.ssl,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
            idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
            max: parseInt(process.env.PG_POOL_MAX || '20', 10),
        };

        const pool = new Pool(poolConfig);

        pool.on('error', (err) => {
            console.error(`Pool error for ${dbName}:`, err);
        });

        pool.on('connect', () => {
            console.log(`{Connected to database: ${dbName}}`);
        });

        return pool;
    }

    /**
     * Close all pools
     */
    async closeAll(): Promise<void> {
        const pools = Array.from(this.pools.values());
        await Promise.all(pools.map(pool => pool.end()));
        this.pools.clear();
        console.log('{All database connections closed}');
    }

    /**
     * Health check for a domain
     */
    async healthCheck(domain: string): Promise<boolean> {
        try {
            await this.queryMaster(domain, 'SELECT 1');
            return true;
        } catch (error) {
            console.error(`Health check failed for ${domain}:`, error);
            return false;
        }
    }
}