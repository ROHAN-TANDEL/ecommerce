// src/platform/context.ts
import express from 'express';
import { ProductConfig } from './config/ProductConfig.js';
import { ProductRegistry } from './registry/ProductRegistry.js';
import { ConnectionManager } from './database/ConnectionManager.js';
import { RouteBinder } from './routebind/RouteBinder.js';

export interface DatabaseAccess {
    master: {
        query: (text: string, params?: any[]) => Promise<any>;
        getPool: () => any;
    };
    client: {
        query: (text: string, params?: any[]) => Promise<any>;
        getPool: () => any;
    };
}

export interface PlatformContext {
    products: ProductConfig;
    registry: ProductRegistry;
    database: ConnectionManager;
    getDatabase(productId: string): DatabaseAccess;

    // Auto-register all routes from config
    autoRegister(): express.Router;

    // Register specific product
    registerProduct(productId: string): express.Router;
}

export function createPlatformContext(
    routeModules: Map<string, any> // Route name → Route class
): PlatformContext {
    const productConfig = new ProductConfig();
    const productRegistry = new ProductRegistry(productConfig);
    const connectionManager = new ConnectionManager();
    const routeBinder = new RouteBinder(
        {
            registry: productRegistry,
            products: productConfig,
            getDatabase: (productId: string) => {
                return getDatabaseAccess(productId, productConfig, connectionManager);
            }
        } as any,
        routeModules
    );

    function getDatabaseAccess(productId: string): DatabaseAccess {
        productRegistry.validateProduct(productId);
        const product = productConfig.getProduct(productId);
        if (!product) throw new Error(`Product "${productId}" not found`);

        return {
            master: {
                query: async (text: string, params?: any[]) => {
                    if (!product.master.enabled) {
                        throw new Error(`Master database not enabled for product "${productId}"`);
                    }
                    return connectionManager.query(
                        productId,
                        'master',
                        product.master.database!,
                        text,
                        params
                    );
                },
                getPool: () => {
                    if (!product.master.enabled) {
                        throw new Error(`Master database not enabled for product "${productId}"`);
                    }
                    return connectionManager.getConnection(
                        productId,
                        'master',
                        product.master.database!
                    );
                }
            },
            client: {
                query: async (text: string, params?: any[]) => {
                    if (!product.client.enabled) {
                        throw new Error(`Client database not enabled for product "${productId}"`);
                    }
                    return connectionManager.query(
                        productId,
                        'client',
                        product.client.database!,
                        text,
                        params
                    );
                },
                getPool: () => {
                    if (!product.client.enabled) {
                        throw new Error(`Client database not enabled for product "${productId}"`);
                    }
                    return connectionManager.getConnection(
                        productId,
                        'client',
                        product.client.database!
                    );
                }
            }
        };
    }

    const context: PlatformContext = {
        products: productConfig,
        registry: productRegistry,
        database: connectionManager,
        getDatabase: getDatabaseAccess,
        autoRegister: () => {
            return routeBinder.autoRegister();
        },
        registerProduct: (productId: string) => {
            return routeBinder.registerProduct(productId);
        }
    };

    return context;
}

export * from './config/ProductConfig.js';
export * from './registry/ProductRegistry.js';
export * from './database/ConnectionManager.js';
export * from './routebind/RouteBinder.js';