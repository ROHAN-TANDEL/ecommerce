import express from 'express';
import type { PoolClient } from 'pg';
import { ProductConfig, type PoolConfig } from './config/ProductConfig.js';
import { ProductRegistry } from './registry/ProductRegistry.js';
import { ConnectionManager } from './database/ConnectionManager.js';
import { RouteBinder } from './routebind/RouteBinder.js';
import { ApiRegistry } from './registry/ApiRegistry.js';

export interface RoleAccess {
    query: (text: string, params?: any[]) => Promise<any>;
    getPool: () => Promise<any>;
    getConnection: () => Promise<PoolClient>;
    withTransaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
    transaction: (queries: Array<{ text: string; params?: any[] }>) => Promise<any[]>;
    getPoolInfo: () => any;
    getPoolConfig: () => PoolConfig | null;
    updatePoolConfig: (config: Partial<PoolConfig>) => Promise<void>;
}

export interface TenantAccess {
    master: RoleAccess | null;
    client: RoleAccess | null;
}

export interface DatabaseAccess {
    /** Explicit role accessor: db.get('master'), db.get('client') */
    get(role: string): RoleAccess;
    /** Shorthand role access: db.master, db.client, db.analytics */
    [role: string]: any;
    /**
     * Tenant-scoped access.
     * @param tenantId - tenant identifier
     * @param schema   - optional explicit schema; defaults to `tenant_<tenantId>` if omitted.
     *                   TenantMiddleware always passes the DB-resolved schema here.
     */
    withTenant(tenantId: string, schema?: string): TenantAccess;
}

export interface PlatformContext {
    products: ProductConfig;
    registry: ProductRegistry;
    apiRegistry: ApiRegistry;
    database: ConnectionManager;
    getDatabase(productId: string): DatabaseAccess;
    autoRegister(): express.Router;
    registerProduct(productId: string): express.Router;
    close(): Promise<void>;
    health: {
        check: () => Promise<{ healthy: boolean; pools: any[] }>;
        ready: () => Promise<boolean>;
        live: () => boolean;
    };
    queries: {
        getLogs: (limit?: number, filter?: any) => any[];
        clearLogs: () => void;
        getStats: (productId?: string, role?: string) => any;
    };
    leaks: {
        getInfo: () => Record<string, number>;
        hasLeaks: () => boolean;
    };
    on: (event: string, callback: Function) => void;
    logPoolStatus: () => void;
}

export function createPlatformContext(routeModules: Map<string, any>): PlatformContext {
    const productConfig = new ProductConfig();
    const productRegistry = new ProductRegistry(productConfig);
    const apiRegistry = new ApiRegistry();
    const connectionManager = new ConnectionManager();

    /**
     * Build a RoleAccess object for a specific product + role.
     * All calls are lazy — no pool is created until the first query.
     */
    function buildRoleAccess(productId: string, role: string): RoleAccess {
        const config = productConfig.getRoleConfig(productId, role);
        if (!config) throw new Error(`No database config for role "${role}" in product "${productId}"`);

        return {
            query: (text, params) =>
                connectionManager.query(productId, role, config, text, params),

            getPool: () =>
                connectionManager.getPool(productId, role, config),

            getConnection: () =>
                connectionManager.getConnection(productId, role, config),

            withTransaction: <T>(cb: (c: PoolClient) => Promise<T>) =>
                connectionManager.withTransaction(productId, role, config, cb),

            transaction: (queries) =>
                connectionManager.transaction(productId, role, config, queries),

            getPoolInfo: () =>
                connectionManager.getPoolInfo(productId, role),

            getPoolConfig: () =>
                connectionManager.getPoolConfig(productId, role),

            updatePoolConfig: (partial) =>
                connectionManager.updatePoolConfig(productId, role, partial),
        };
    }

    /**
     * Build a tenant-scoped RoleAccess for the 'client' role.
     * Every query switches search_path to the given schema before executing.
     */
    function buildTenantClientAccess(productId: string, tenantId: string, schema: string): RoleAccess {
        const config = productConfig.getRoleConfig(productId, 'client');
        if (!config) throw new Error(`No database config for role "client" in product "${productId}"`);

        const tenant = { id: tenantId, schema };

        return {
            query: (text, params) =>
                connectionManager.queryWithTenant(productId, 'client', tenant, text, params),

            getPool: () =>
                connectionManager.getTenantConnection(productId, 'client', tenant),

            getConnection: () =>
                connectionManager.getTenantConnection(productId, 'client', tenant),

            withTransaction: <T>(cb: (c: PoolClient) => Promise<T>) =>
                connectionManager.withTenantTransaction(productId, 'client', tenant, cb),

            transaction: (queries) =>
                connectionManager.transaction(productId, 'client', config, queries),

            getPoolInfo: () =>
                connectionManager.getPoolInfo(productId, 'client'),

            getPoolConfig: () =>
                connectionManager.getPoolConfig(productId, 'client'),

            updatePoolConfig: (partial) =>
                connectionManager.updatePoolConfig(productId, 'client', partial),
        };
    }

    /**
     * Returns a DatabaseAccess proxy for a given product.
     * Supports:
     *   db.get('master')          — explicit role accessor
     *   db.master / db.client     — shorthand (goes through Proxy)
     *   db.withTenant(id)         — tenant-scoped access
     */
    function getDatabaseAccess(productId: string): DatabaseAccess {
        productRegistry.validateProduct(productId);

        const enabledRoles = productConfig.getEnabledRoles(productId);

        const roleAccessor = {
            get: (role: string): RoleAccess => {
                if (!enabledRoles.includes(role)) {
                    throw new Error(`Role "${role}" is not enabled for product "${productId}"`);
                }
                return buildRoleAccess(productId, role);
            }
        };

        const db = new Proxy(roleAccessor, {
            get: (target, prop: string | symbol) => {
                if (prop === 'get') return target.get;

                if (prop === 'withTenant') {
                    return (tenantId: string, schema?: string): TenantAccess => {
                        // Use the explicit schema when provided (from TenantMiddleware after DB lookup).
                        // Fall back to convention only for inline/manual usage.
                        const resolvedSchema = schema ?? `tenant_${tenantId}`;

                        const masterConfig = productConfig.getRoleConfig(productId, 'master');
                        const clientEnabled = enabledRoles.includes('client');

                        return {
                            master: masterConfig ? buildRoleAccess(productId, 'master') : null,
                            client: clientEnabled ? buildTenantClientAccess(productId, tenantId, resolvedSchema) : null,
                        };
                    };
                }

                // Shorthand: db.master, db.client, db.analytics
                if (typeof prop === 'string') {
                    return target.get(prop);
                }

                return undefined;
            }
        });

        return db as DatabaseAccess;
    }

    // RouteBinder only needs products, registry, apiRegistry, getDatabase — pass a minimal
    // typed object rather than the full PlatformContext to avoid the circular dependency.
    const routeBinder = new RouteBinder(
        {
            products: productConfig,
            registry: productRegistry,
            apiRegistry,
            getDatabase: getDatabaseAccess,
            connectionManager,
        },
        routeModules
    );

    const platform: PlatformContext = {
        products: productConfig,
        registry: productRegistry,
        apiRegistry,
        database: connectionManager,
        getDatabase: getDatabaseAccess,

        autoRegister: () => routeBinder.autoRegister(),
        registerProduct: (productId) => routeBinder.registerProduct(productId),

        close: () => connectionManager.closeAll(),

        health: {
            check: () => connectionManager.healthCheck(),
            ready: async () => {
                const result = await connectionManager.healthCheck();
                return result.healthy;
            },
            live: () => !connectionManager.isShuttingDown,
        },

        queries: {
            getLogs: (limit?, filter?) => connectionManager.getQueryLogs(limit, filter),
            clearLogs: () => connectionManager.clearQueryLogs(),
            getStats: (productId?, role?) => connectionManager.getQueryStats(productId, role),
        },

        leaks: {
            getInfo: () => connectionManager.getLeakInfo(),
            hasLeaks: () => Object.keys(connectionManager.getLeakInfo()).length > 0,
        },

        on: (event, callback) => connectionManager.on(event, callback),
        logPoolStatus: () => connectionManager.logPoolStatus(),
    };

    return platform;
}

export * from './config/ProductConfig.js';
export * from './registry/ProductRegistry.js';
export * from './registry/ApiRegistry.js';
export * from './database/ConnectionManager.js';
export * from './routebind/RouteBinder.js';
