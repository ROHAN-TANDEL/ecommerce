// src/platform/core/database/types.ts

/**
 * Database connection configuration
 */
export interface DatabaseConnectionConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
    connectionTimeoutMillis?: number;
}

/**
 * Database reference - points to a named database configuration
 */
export interface DatabaseReference {
    name: string;                    // Logical name: "iam_master", "shared_db"
    connection: DatabaseConnectionConfig;
}

/**
 * Domain to Database mapping
 */
export interface DomainDatabaseMapping {
    domain: string;                  // Domain name
    masterDb: string;                // Reference to master database
    clientDb?: string;               // Reference to client database
    readDb?: string;                 // Reference to read replica
    writeDb?: string;                // Reference to write replica
}

/**
 * Full configuration with database pool and domain mappings
 */
export interface DatabasePoolConfig {
    // All available databases
    databases: Record<string, DatabaseConnectionConfig>;

    // Domain to database mappings
    mappings: DomainDatabaseMapping[];

    // Default strategy for unmapped domains
    defaultStrategy?: DatabaseStrategy;
}

/**
 * Domain runtime configuration (resolved from mappings)
 */
export interface DomainRuntimeConfig {
    domain: string;
    strategy: DatabaseStrategy;
    masterPool: string;              // Resolved database name
    clientPool?: string;             // Resolved database name
    readPool?: string;               // Resolved database name
    writePool?: string;              // Resolved database name
    schemas: {
        master: SchemaConfig[];
        client: SchemaConfig[];
        defaultSchema: string;
    };
    tenant: {
        enabled: boolean;
        headerName?: string;
        validationRequired?: boolean;
        allowAnonymous?: boolean;
    };
}

export type DatabaseStrategy =
    | 'single_db_single_schema'
    | 'single_db_multi_schema'
    | 'multi_db_single_schema'
    | 'multi_db_multi_schema'
    | 'read_write_separated'
    | 'tenant_schema_per_database';