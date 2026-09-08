// src/platform/context.ts
import express from 'express';
import { ProductConfig, ProductDefinition } from './config/ProductConfig.js';
import { ProductRegistry } from './registry/ProductRegistry.js';
import { ConnectionManager } from './database/ConnectionManager.js';
import { RouteBinder } from './routebind/RouteBinder.js';
import { ApiRegistry } from './registry/ApiRegistry.js';

export interface DatabaseAccess {
    // Dynamic role access via proxy
    [role: string]: any;

    get(role: string): {
        query: (text: string, params?: any[]) => Promise<any>;
        getPool: () => any;
        getConnection: () => Promise<PoolClient>;
        withTransaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
        transaction: (queries: Array<{ text: string; params?: any[] }>) => Promise<any[]>;
        getPoolInfo: () => any;
        getPoolConfig: () => any;
        updatePoolConfig: (config: Partial<PoolConfig>) => Promise<void>;
    };

    // Tenant-aware methods
    withTenant(tenantId: string): {
        master: DatabaseAccess;
        client: DatabaseAccess;
    };
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
}

export function createPlatformContext(
    routeModules: Map<string, any>
): PlatformContext {
    // Initialize components
    const productConfig = new ProductConfig();
    const productRegistry = new ProductRegistry(productConfig);
    const apiRegistry = new ApiRegistry();
    const connectionManager = new ConnectionManager();

    function getDatabaseAccess(productId: string): DatabaseAccess {

        productRegistry.validateProduct(productId);
        const product = productConfig.getProduct(productId);
        if (!product) throw new Error(`Product "${productId}" not found`);

        // Get all enabled roles
        const enabledRoles = productConfig.getEnabledRoles(productId);

        // Create role accessor
        const roleAccessor = {
            get: (role: string) => {
                if (!enabledRoles.includes(role)) {
                    throw new Error(`Role "${role}" is not enabled for product "${productId}"`);
                }

                const config = productConfig.getRoleConfig(productId, role);
                if (!config) {
                    throw new Error(`No database config for role "${role}" in product "${productId}"`);
                }

                return {
                    // Simple query - auto manages connection
                    query: async (text: string, params?: any[]) => {
                        return connectionManager.query(
                            productId,
                            role,
                            config,
                            text,
                            params
                        );
                    },

                    // Get raw pool for advanced use
                    getPool: () => {
                        return connectionManager.getPool(
                            productId,
                            role,
                            config
                        );
                    },

                    // Get a connection for transactions
                    getConnection: () => {
                        return connectionManager.getConnection(
                            productId,
                            role,
                            config
                        );
                    },

                    // Transaction helper
                    withTransaction: async <T>(
                        callback: (client: PoolClient) => Promise<T>
                    ): Promise<T> => {
                        return connectionManager.withTransaction(
                            productId,
                            role,
                            config,
                            callback
                        );
                    },

                    // Multiple queries in transaction
                    transaction: async (queries: Array<{ text: string; params?: any[] }>) => {
                        return connectionManager.transaction(
                            productId,
                            role,
                            config,
                            queries
                        );
                    }
                };
            }
        };

        const baseDb = {
            get: (role: string) => {
                // ... existing code
            }
        };

        // Add tenant-aware methods
        const db = new Proxy(baseDb, {
            get: (target, prop: string | symbol) => {
                if (prop === 'withTenant') {
                    return (tenantId: string) => {
                        return {
                            master: target.get('master'),
                            client: {
                                query: async (text: string, params?: any[]) => {
                                    const tenant = tenantContext.resolve(tenantId);
                                    return connectionManager.queryWithTenant(
                                        productId,
                                        'client',
                                        tenant,
                                        text,
                                        params
                                    );
                                },
                                getPool: () => {
                                    const tenant = tenantContext.resolve(tenantId);
                                    return connectionManager.getTenantConnection(
                                        productId,
                                        'client',
                                        tenant
                                    );
                                },
                                withTransaction: async <T>(
                                    callback: (client: PoolClient) => Promise<T>
                                ) => {
                                    const tenant = tenantContext.resolve(tenantId);
                                    return connectionManager.withTenantTransaction(
                                        productId,
                                        'client',
                                        tenant,
                                        callback
                                    );
                                }
                            }
                        };
                    };
                }

                // Handle role access normally
                if (typeof prop === 'string' && prop !== 'get' && prop !== 'withTenant') {
                    return target.get(prop);
                }

                return target[prop];
            }
        });

        return db as DatabaseAccess;


        // Create proxy that intercepts property access
        // return new Proxy(roleAccessor, {
        //     get: (target, prop: string | symbol) => {
        //         if (prop === 'get') {
        //             return target.get;
        //         }
        //         if (typeof prop === 'string' && prop !== 'get') {
        //             return target.get(prop);
        //         }
        //         return undefined;
        //     }
        // }) as DatabaseAccess;
    }

    // Create RouteBinder
    const routeBinder = new RouteBinder(
        {
            products: productConfig,
            registry: productRegistry,
            apiRegistry: apiRegistry,
            getDatabase: getDatabaseAccess
        },
        routeModules
    );

    return {
        products: productConfig,
        registry: productRegistry,
        apiRegistry: apiRegistry,
        database: connectionManager,
        getDatabase: getDatabaseAccess,

        autoRegister: () => {
            return routeBinder.autoRegister();
        },

        registerProduct: (productId: string) => {
            return routeBinder.registerProduct(productId);
        },

        close: async () => {
            await connectionManager.closeAll();
        },

        health: {
            check: async () => {
                return connectionManager.healthCheck();
            },
            ready: async () => {
                const result = await connectionManager.healthCheck();
                return result.healthy;
            },
            live: () => {
                return !connectionManager['isShuttingDown'];
            }
        },

        // Query logging
        queries: {
            getLogs: (limit?: number, filter?: any) => {
                return connectionManager.getQueryLogs(limit, filter);
            },
            clearLogs: () => {
                connectionManager.clearQueryLogs();
            },
            getStats: (productId?: string, role?: string) => {
                return connectionManager.getQueryStats(productId, role);
            }
        },

        // Leak detection
        leaks: {
            getInfo: () => {
                return connectionManager.getLeakInfo();
            },
            hasLeaks: () => {
                const leaks = connectionManager.getLeakInfo();
                return Object.keys(leaks).length > 0;
            }
        },

        // Events
        on: (event: string, callback: Function) => {
            connectionManager.on(event, callback);
        },

        // Log pool status
        logPoolStatus: () => {
            connectionManager.logPoolStatus();
        }
    };
}

/**
 * // Just add to config
 * {
 *   "products": [{
 *     "id": "identity_access_management",
 *     "roles": {
 *       "master": { ... },
 *       "client": { ... },
 *       "analytics": {
 *         "enabled": true,
 *         "database": { ... }
 *       }
 *     }
 *   }]
 * }
 * // All of these work dynamically based on config
 * req.db.master         // If master role is enabled
 * req.db.client         // If client role is enabled
 * req.db.analytics      // If analytics role is enabled
 * req.db.archive        // If archive role is enabled
 * req.db.reporting      // If reporting role is enabled
 * req.db.get('master')  // Explicit get method
 * req.db.get('analytics') // Explicit get method
 *
 * usage - const data = await req.db.analytics.query('SELECT * FROM reports');
 */

export * from './config/ProductConfig.js';
export * from './registry/ProductRegistry.js';
export * from './registry/ApiRegistry.js';
export * from './database/ConnectionManager.js';
export * from './routebind/RouteBinder.js';