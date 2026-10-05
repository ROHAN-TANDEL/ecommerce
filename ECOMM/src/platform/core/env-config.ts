// src/platform/core/database/env-config.ts

import { DomainConfig, DatabaseStrategy, DatabaseConnectionConfig, SchemaConfig } from './types';
import { DomainConfigBuilder } from './config-builder';

/**
 * Environment Configuration Parser
 *
 * Reads domain configurations from environment variables
 * Format: DOMAIN_[DOMAIN_NAME]_[KEY]=value
 */
export class EnvConfigParser {
    /**
     * Parse all domain configurations from environment variables
     */
    static parseDomains(): Record<string, DomainConfig> {
        const domains: Record<string, DomainConfig> = {};
        const domainNames = this.getDomainNames();

        for (const domainName of domainNames) {
            try {
                domains[domainName] = this.parseDomain(domainName);
            } catch (error) {
                console.error(`Failed to parse domain ${domainName}:`, error);
                throw error;
            }
        }

        return domains;
    }

    /**
     * Get all domain names from environment variables
     * Looks for: DOMAIN_[NAME]_STRATEGY
     */
    static getDomainNames(): string[] {
        const names: string[] = [];
        const prefix = 'DOMAIN_';
        const suffix = '_STRATEGY';

        for (const key of Object.keys(process.env)) {
            if (key.startsWith(prefix) && key.endsWith(suffix)) {
                const domainName = key
                    .slice(prefix.length, -suffix.length)
                    .toLowerCase();
                names.push(domainName);
            }
        }

        return names;
    }

    /**
     * Parse a single domain configuration
     */
    static parseDomain(domainName: string): DomainConfig {
        const prefix = `DOMAIN_${domainName.toUpperCase()}_`;

        // Required: Strategy
        const strategy = process.env[`${prefix}STRATEGY`];
        if (!strategy) {
            throw new Error(`Missing STRATEGY for domain: ${domainName}`);
        }

        const builder = new DomainConfigBuilder(domainName)
            .setStrategy(strategy as DatabaseStrategy);

        // Parse database connections
        this.parseDatabaseConnections(domainName, builder);

        // Parse schemas
        this.parseSchemas(domainName, builder);

        // Parse tenant configuration
        this.parseTenantConfig(domainName, builder);

        return builder.build();
    }

    /**
     * Parse database connections
     */
    private static parseDatabaseConnections(
        domainName: string,
        builder: DomainConfigBuilder
    ): void {
        const prefix = `DOMAIN_${domainName.toUpperCase()}_DB_`;

        // Check for single connection
        const singleHost = process.env[`${prefix}HOST`];
        if (singleHost) {
            builder.addSingleDatabase({
                host: singleHost,
                port: Number(process.env[`${prefix}PORT`] || 5432),
                user: process.env[`${prefix}USERNAME`] || 'root',
                password: process.env[`${prefix}PASSWORD`] || '',
                database: process.env[`${prefix}DATABASE`] || domainName,
                ssl: process.env[`${prefix}SSL`] === 'true'
            });
            return;
        }

        // Check for master connection
        const masterHost = process.env[`${prefix}MASTER_HOST`];
        if (masterHost) {
            builder.addMasterDatabase({
                host: masterHost,
                port: Number(process.env[`${prefix}MASTER_PORT`] || 5432),
                user: process.env[`${prefix}MASTER_USERNAME`] || 'root',
                password: process.env[`${prefix}MASTER_PASSWORD`] || '',
                database: process.env[`${prefix}MASTER_DATABASE`] || `${domainName}_master`,
                ssl: process.env[`${prefix}MASTER_SSL`] === 'true'
            });
        }

        // Check for client connection
        const clientHost = process.env[`${prefix}CLIENT_HOST`];
        if (clientHost) {
            builder.addClientDatabase({
                host: clientHost,
                port: Number(process.env[`${prefix}CLIENT_PORT`] || 5432),
                user: process.env[`${prefix}CLIENT_USERNAME`] || 'root',
                password: process.env[`${prefix}CLIENT_PASSWORD`] || '',
                database: process.env[`${prefix}CLIENT_DATABASE`] || `${domainName}_client`,
                ssl: process.env[`${prefix}CLIENT_SSL`] === 'true'
            });
        }

        // Check for read/write separated
        const readHost = process.env[`${prefix}READ_HOST`];
        const writeHost = process.env[`${prefix}WRITE_HOST`];
        if (readHost && writeHost) {
            builder.addReadWriteDatabases(
                {
                    host: readHost,
                    port: Number(process.env[`${prefix}READ_PORT`] || 5432),
                    user: process.env[`${prefix}READ_USERNAME`] || 'root',
                    password: process.env[`${prefix}READ_PASSWORD`] || '',
                    database: process.env[`${prefix}READ_DATABASE`] || `${domainName}_read`,
                    ssl: process.env[`${prefix}READ_SSL`] === 'true'
                },
                {
                    host: writeHost,
                    port: Number(process.env[`${prefix}WRITE_PORT`] || 5432),
                    user: process.env[`${prefix}WRITE_USERNAME`] || 'root',
                    password: process.env[`${prefix}WRITE_PASSWORD`] || '',
                    database: process.env[`${prefix}WRITE_DATABASE`] || `${domainName}_write`,
                    ssl: process.env[`${prefix}WRITE_SSL`] === 'true'
                }
            );
        }
    }

    /**
     * Parse schemas
     */
    private static parseSchemas(
        domainName: string,
        builder: DomainConfigBuilder
    ): void {
        const prefix = `DOMAIN_${domainName.toUpperCase()}_SCHEMA_`;

        // Parse master schemas
        const masterSchemas = this.parseSchemaList(domainName, 'MASTER');
        for (const schema of masterSchemas) {
            builder.addMasterSchema(schema);
        }

        // Parse client schemas
        const clientSchemas = this.parseSchemaList(domainName, 'CLIENT');
        for (const schema of clientSchemas) {
            builder.addClientSchema(schema);
        }

        // Set default schema
        const defaultSchema = process.env[`${prefix}DEFAULT`];
        if (defaultSchema) {
            builder.setDefaultSchema(defaultSchema);
        }
    }

    /**
     * Parse a list of schemas from environment variables
     */
    private static parseSchemaList(
        domainName: string,
        type: 'MASTER' | 'CLIENT'
    ): SchemaConfig[] {
        const prefix = `DOMAIN_${domainName.toUpperCase()}_SCHEMA_${type}_`;
        const schemas: SchemaConfig[] = [];

        // Get schema names from environment
        // Format: DOMAIN_X_SCHEMA_MASTER_NAMES=public,auth,tenant_
        const namesStr = process.env[`${prefix}NAMES`];
        if (!namesStr) return schemas;

        const names = namesStr.split(',').map(s => s.trim());

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const index = i + 1;

            // Check if this schema has specific config
            const isDefault = process.env[`${prefix}${index}_DEFAULT`] === 'true';
            const isShared = process.env[`${prefix}${index}_SHARED`] !== 'false';
            const isTenantSpecific = process.env[`${prefix}${index}_TENANT_SPECIFIC`] === 'true';
            const searchPath = process.env[`${prefix}${index}_SEARCH_PATH`]?.split(',').map(s => s.trim());
            const extensions = process.env[`${prefix}${index}_EXTENSIONS`]?.split(',').map(s => s.trim());
            const tables = process.env[`${prefix}${index}_TABLES`]?.split(',').map(s => s.trim());

            schemas.push({
                name,
                default: isDefault,
                shared: isShared,
                tenantSpecific: isTenantSpecific,
                searchPath,
                extensions,
                tables
            });
        }

        return schemas;
    }

    /**
     * Parse tenant configuration
     */
    private static parseTenantConfig(
        domainName: string,
        builder: DomainConfigBuilder
    ): void {
        const prefix = `DOMAIN_${domainName.toUpperCase()}_TENANT_`;

        const enabled = process.env[`${prefix}ENABLED`] !== 'false';

        if (enabled) {
            const headerName = process.env[`${prefix}HEADER`] || 'x-tenant-id';
            builder.enableTenant(headerName);
        } else {
            builder.disableTenant();
        }
    }
}