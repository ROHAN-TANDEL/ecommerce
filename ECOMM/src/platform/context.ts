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

    // Explicit methods
    get(role: string): {
        query: (text: string, params?: any[]) => Promise<any>;
        getPool: () => any;
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
                    query: async (text: string, params?: any[]) => {
                        return connectionManager.query(
                            productId,
                            role,
                            config,
                            text,
                            params
                        );
                    },
                    getPool: () => {
                        return connectionManager.getConnection(
                            productId,
                            role,
                            config
                        );
                    }
                };
            }
        };

        // Create proxy that intercepts property access
        return new Proxy(roleAccessor, {
            get: (target, prop: string | symbol) => {
                // If 'get' is called directly
                if (prop === 'get') {
                    return target.get;
                }

                // If property is a role name (like 'master', 'client', 'analytics')
                if (typeof prop === 'string' && prop !== 'get') {
                    return target.get(prop);
                }

                // Fallback
                return undefined;
            }
        }) as DatabaseAccess;
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