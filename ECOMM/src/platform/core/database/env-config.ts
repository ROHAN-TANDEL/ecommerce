// src/platform/core/database/env-config.ts

import {
    DatabaseConnectionConfig,
    DomainDatabaseMapping,
    DatabasePoolConfig,
    DatabaseStrategy,
    DomainRuntimeConfig,
    SchemaConfig
} from './types';

export class EnvConfigParser {

    /**
     * Parse database pool and domain mappings from environment
     */
    static parseFullConfig(): DatabasePoolConfig {
        // 1. Parse all databases
        const databases = this.parseDatabases();

        // 2. Parse domain mappings
        const mappings = this.parseMappings();

        return {
            databases,
            mappings,
            defaultStrategy: process.env.DB_DEFAULT_STRATEGY as DatabaseStrategy || 'multi_db_multi_schema'
        };
    }

    /**
     * Parse all database connections
     * Format: DB_[NAME]_HOST, DB_[NAME]_PORT, etc.
     */
    private static parseDatabases(): Record<string, DatabaseConnectionConfig> {
        const databases: Record<string, DatabaseConnectionConfig> = {};
        const dbNames = this.getDatabaseNames();

        for (const name of dbNames) {
            const prefix = `DB_${name.toUpperCase()}_`;
            databases[name] = {
                host: process.env[`${prefix}HOST`] || '127.0.0.1',
                port: Number(process.env[`${prefix}PORT`] || 5432),
                user: process.env[`${prefix}USERNAME`] || 'root',
                password: process.env[`${prefix}PASSWORD`] || '',
                database: process.env[`${prefix}DATABASE`] || name,
                ssl: process.env[`${prefix}SSL`] === 'true'
            };
        }

        return databases;
    }

    /**
     * Parse domain to database mappings
     * Format: MAPPING_[DOMAIN]_MASTER=db_name
     *         MAPPING_[DOMAIN]_CLIENT=db_name
     */
    private static parseMappings(): DomainDatabaseMapping[] {
        const mappings: DomainDatabaseMapping[] = [];
        const domainNames = this.getDomainNames();

        for (const domain of domainNames) {
            const prefix = `MAPPING_${domain.toUpperCase()}_`;

            const mapping: DomainDatabaseMapping = {
                domain: domain,
                masterDb: process.env[`${prefix}MASTER`] || `${domain}_master`,
                clientDb: process.env[`${prefix}CLIENT`],
                readDb: process.env[`${prefix}READ`],
                writeDb: process.env[`${prefix}WRITE`]
            };

            mappings.push(mapping);
        }

        return mappings;
    }

    /**
     * Get all database names from environment
     */
    private static getDatabaseNames(): string[] {
        const names: string[] = [];
        const prefix = 'DB_';
        const suffix = '_HOST';

        for (const key of Object.keys(process.env)) {
            if (key.startsWith(prefix) && key.endsWith(suffix)) {
                const name = key.slice(prefix.length, -suffix.length).toLowerCase();
                names.push(name);
            }
        }

        return names;
    }

    /**
     * Get all domain names from environment
     */
    private static getDomainNames(): string[] {
        const names: string[] = [];
        const prefix = 'MAPPING_';
        const suffix = '_MASTER';

        for (const key of Object.keys(process.env)) {
            if (key.startsWith(prefix) && key.endsWith(suffix)) {
                const name = key.slice(prefix.length, -suffix.length).toLowerCase();
                names.push(name);
            }
        }

        return names;
    }

    /**
     * Resolve domain runtime config from mappings
     */
    static resolveDomainConfig(
        domain: string,
        poolConfig: DatabasePoolConfig,
        strategies: Record<string, DatabaseStrategy>,
        schemas: Record<string, { master: SchemaConfig[]; client: SchemaConfig[]; defaultSchema: string }>,
        tenantConfigs: Record<string, any>
    ): DomainRuntimeConfig {
        const mapping = poolConfig.mappings.find(m => m.domain === domain);
        if (!mapping) {
            throw new Error(`No mapping found for domain: ${domain}`);
        }

        const strategy = strategies[domain] || poolConfig.defaultStrategy || 'multi_db_single_schema';
        const schemasForDomain = schemas[domain] || { master: [], client: [], defaultSchema: 'public' };
        const tenant = tenantConfigs[domain] || { enabled: true, headerName: 'x-tenant-id' };

        return {
            domain,
            strategy: strategy as DatabaseStrategy,
            masterPool: mapping.masterDb,
            clientPool: mapping.clientDb,
            readPool: mapping.readDb,
            writePool: mapping.writeDb,
            schemas: schemasForDomain,
            tenant: {
                enabled: tenant.enabled !== false,
                headerName: tenant.headerName || 'x-tenant-id',
                validationRequired: tenant.validationRequired !== false,
                allowAnonymous: tenant.allowAnonymous === true
            }
        };
    }
}