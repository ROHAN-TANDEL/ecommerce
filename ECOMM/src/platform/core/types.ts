// src/platform/core/types.ts

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface DatabaseConnectionConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
    connectionTimeoutMillis?: number;
}

export interface DomainConfig {
    name: string;
    status: boolean;
    strategy: 'single_db' | 'multi_db' | 'read_write_separated';
    masterDb: string;
    clientDb?: string;
    readDb?: string;
    writeDb?: string;
    tenant: {
        enabled: boolean;
        headerName: string;
    };
}

export interface ApiRegistration {
    id: string;
    method: ApiMethod;
    path: string;
    domain: string;
    tenant: boolean;
}

export interface ApiMatch {
    api: ApiRegistration;
    params: Record<string, string>;
}

export interface RequestContext {
    api: {
        id: string;
        method: string;
        path: string;
        domain: string;
    };
    tenant?: {
        id: string;
    };
    db: {
        master: any;      // Pool or client
        client?: any;     // Pool or client
    };
}