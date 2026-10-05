// src/platform/core/database/connection-manager.ts

import { Pool, PoolClient, PoolConfig } from 'pg';
import {
    DatabaseConnectionConfig,
    DatabasePoolConfig,
    DomainRuntimeConfig,
    DatabaseStrategy
} from './types';
import { EnvConfigParser } from './env-config';

export class ConnectionManager {
    private readonly pools = new Map<string, Pool>();
    private readonly databases: Record<string, DatabaseConnectionConfig>;
    private readonly domainConfigs = new Map<string, DomainRuntimeConfig>();
    private readonly poolConfig: DatabasePoolConfig;

    constructor() {
        // Parse full configuration from environment
        this.poolConfig = EnvConfigParser.parseFullConfig();
        this.databases = this.poolConfig.databases;

        // Resolve domain configurations
        this.resolveDomainConfigs();

        console.log('{ Database pool initialized }');
        console.log(`{ Databases: ${Object.keys(this.databases).join(', ')}}`);
        console.log(`{ Domains: ${Array.from(this.domainConfigs.keys()).join(', ')}}`);
    }

    /**
     * Resolve all domain configurations
     */
    private resolveDomainConfigs(): void {
        const strategies = this.parseStrategies();
        const schemas = this.parseSchemas();
        const tenants = this.parseTenants();

        for (const mapping of this.poolConfig.mappings) {
            const config = EnvConfigParser.resolveDomainConfig(
                mapping.domain,
                this.poolConfig,
                strategies,
                schemas,
                tenants
            );
            this.domainConfigs.set(mapping.domain, config);
        }
    }

    /**
     * Get domain configuration
     */
    getDomainConfig(domain: string): DomainRuntimeConfig {
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
     * Get a pool for a domain and type
     * Resolves the actual database name from the domain mapping
     */
    getPool(
        domain: string,
        type: 'master' | 'client' | 'read' | 'write'
    ): Pool {
        const config = this.getDomainConfig(domain);
        let dbName: string;

        switch (type) {
            case 'master':
                dbName = config.masterPool;
                break;
            case 'client':
                dbName = config.clientPool || config.masterPool;
                break;
            case 'read':
                dbName = config.readPool || config.masterPool;
                break;
            case 'write':
                dbName = config.writePool || config.masterPool;
                break;
            default:
                dbName = config.masterPool;
        }

        const poolKey = `${domain}:${type}:${dbName}`;
        const existingPool = this.pools.get(poolKey);
        if (existingPool) {
            return existingPool;
        }

        const dbConfig = this.databases[dbName];
        if (!dbConfig) {
            throw new Error(`Database not configured: ${dbName} (for domain ${domain}:${type})`);
        }

        const pool = this.createPool(dbConfig, domain, type, dbName);
        this.pools.set(poolKey, pool);
        return pool;
    }

    /**
     * Get a client connection
     */
    async getClient(
        domain: string,
        type: 'master' | 'client' | 'read' | 'write'
    ): Promise<PoolClient> {
        const pool = this.getPool(domain, type);
        return pool.connect();
    }

    /**
     * Get pool with retry logic
     */
    async getClientWithRetry(
        domain: string,
        type: 'master' | 'client' | 'read' | 'write',
        maxAttempts: number = 3
    ): Promise<PoolClient> {
        let lastError: Error;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await this.getClient(domain, type);
            } catch (error) {
                lastError = error as Error;
                console.log(`{Connection attempt ${i + 1} failed for ${domain}:${type}}`);
                if (i < maxAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
        throw lastError!;
    }

    /**
     * Close all pools
     */
    async closeAll(): Promise<void> {
        const pools = Array.from(this.pools.values());
        await Promise.all(pools.map(pool => pool.end()));
        this.pools.clear();
    }

    /**
     * Create a pool
     */
    private createPool(
        config: DatabaseConnectionConfig,
        domain: string,
        type: string,
        dbName: string
    ): Pool {
        const poolConfig: PoolConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            ssl: config.ssl,
            connectionTimeoutMillis: parseInt(process.env.PG_CONNECTION_TIMEOUT || '5000'),
            idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000'),
            max: parseInt(process.env.PG_POOL_MAX || '20'),
        };

        const pool = new Pool(poolConfig);

        pool.on('error', (err) => {
            console.error(`Pool error for ${domain}:${type} (${dbName}):`, err);
        });

        console.log(`{Pool created: ${domain}:${type} → ${dbName}}`);
        return pool;
    }

    // ============================================================
    // Helper parsers
    // ============================================================

    private parseStrategies(): Record<string, DatabaseStrategy> {
        const strategies: Record<string, DatabaseStrategy> = {};
        const prefix = 'STRATEGY_';

        for (const key of Object.keys(process.env)) {
            if (key.startsWith(prefix)) {
                const domain = key.slice(prefix.length).toLowerCase();
                strategies[domain] = process.env[key] as DatabaseStrategy;
            }
        }

        return strategies;
    }

    private parseSchemas(): Record<string, { master: SchemaConfig[]; client: SchemaConfig[]; defaultSchema: string }> {
        const schemas: Record<string, any> = {};
        // Simplified - you can expand this as needed
        return schemas;
    }

    private parseTenants(): Record<string, any> {
        const tenants: Record<string, any> = {};
        const prefix = 'TENANT_';
        const suffix = '_ENABLED';

        for (const key of Object.keys(process.env)) {
            if (key.startsWith(prefix) && key.endsWith(suffix)) {
                const domain = key.slice(prefix.length, -suffix.length).toLowerCase();
                tenants[domain] = {
                    enabled: process.env[key] === 'true'
                };
            }
        }

        return tenants;
    }
}