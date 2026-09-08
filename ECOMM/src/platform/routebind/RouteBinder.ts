// src/platform/routebind/RouteBinder.ts
import express from 'express';
import { TenantMiddleware } from '../middleware/TenantMiddleware.js';

export interface RouteInfo {
    method: string;
    path: string;
    handler: Function;
    middlewares?: Function[];
}

export interface RouteBinderDependencies {
    products: any;
    registry: any;
    apiRegistry: any;
    getDatabase: (productId: string) => any;
    connectionManager?: any;
}

export class RouteBinder {
    private tenantMiddleware: TenantMiddleware;
    private deps: RouteBinderDependencies;
    private routeModules: Map<string, any>;

    constructor(deps: RouteBinderDependencies, routeModules: Map<string, any>) {
        this.deps = deps;
        this.routeModules = routeModules;
        this.tenantMiddleware = new TenantMiddleware(deps as any);
    }

    /**
     * Auto-register all routes from configuration
     * Now handles master/client routes from config
     */
    autoRegister(): express.Router {
        const mainRouter = express.Router();
        const enabledProducts = this.deps.products.getEnabledProducts();

        console.log('\n🚀 Auto-registering routes...');

        for (const product of enabledProducts) {
            console.log(`\n📦 Registering product: ${product.id}`);

            // Get all routes from config (master + client)
            const allRoutes = this.deps.products.getAllRoutes(product.id);

            // Register client routes (with tenant middleware)
            if (allRoutes.client && allRoutes.client.length > 0) {
                const clientClasses = this.getRouteClasses(allRoutes.client);
                if (clientClasses.length > 0) {
                    console.log(`   👤 Client Routes: ${allRoutes.client.join(', ')}`);
                    const clientRouter = this.bindRoutes(clientClasses, product.id, 'client');
                    mainRouter.use(clientRouter);
                }
            }

            // Register master routes (without tenant middleware)
            if (allRoutes.master && allRoutes.master.length > 0) {
                const masterClasses = this.getRouteClasses(allRoutes.master);
                if (masterClasses.length > 0) {
                    console.log(`   🔐 Master Routes: ${allRoutes.master.join(', ')}`);
                    const masterRouter = this.bindRoutes(masterClasses, product.id, 'master');
                    mainRouter.use('/admin', masterRouter);
                }
            }
        }

        return mainRouter;
    }

    /**
     * Register a single product's routes
     */
    registerProduct(productId: string): express.Router {
        const product = this.deps.products.getProduct(productId);
        if (!product) {
            throw new Error(`Product "${productId}" not found`);
        }

        const router = express.Router();
        const allRoutes = this.deps.products.getAllRoutes(productId);

        // Client routes
        if (allRoutes.client && allRoutes.client.length > 0) {
            const clientClasses = this.getRouteClasses(allRoutes.client);
            if (clientClasses.length > 0) {
                const clientRouter = this.bindRoutes(clientClasses, productId, 'client');
                router.use(clientRouter);
            }
        }

        // Master routes
        if (allRoutes.master && allRoutes.master.length > 0) {
            const masterClasses = this.getRouteClasses(allRoutes.master);
            if (masterClasses.length > 0) {
                const masterRouter = this.bindRoutes(masterClasses, productId, 'master');
                router.use('/admin', masterRouter);
            }
        }

        return router;
    }

    /**
     * Get route classes from route names
     */
    private getRouteClasses(routeNames: string[]): any[] {
        const classes: any[] = [];

        for (const name of routeNames) {
            const RouteClass = this.routeModules.get(name);
            if (RouteClass) {
                classes.push(RouteClass);
            } else {
                console.warn(`   ⚠️ Route class "${name}" not found in module registry`);
            }
        }

        return classes;
    }

    /**
     * Bind routes with type (master or client)
     */
    private bindRoutes(routes: any[], productId: string, type: 'master' | 'client'): express.Router {
        this.deps.registry.validateProduct(productId);
        const db = this.deps.getDatabase(productId);
        const router = express.Router();

        // Attach product context
        router.use((req: any, res: any, next: any) => {
            req.productId = productId;
            req.routeType = type; // 'master' or 'client'
            next();
        });

        // Add middleware based on type
        if (type === 'client') {
            // Client routes: tenant required
            router.use((req: any, res: any, next: any) => {
                req.requiresTenant = true;
                next();
            });
            router.use(this.tenantMiddleware.resolve);
            router.use(this.tenantMiddleware.validate);
        } else {
            // Master routes: no tenant
            router.use((req: any, res: any, next: any) => {
                req.requiresTenant = false;
                req.tenant = null;
                req.tenantId = null;
                next();
            });
        }

        // Attach database access based on type
        router.use((req: any, res: any, next: any) => {
            if (type === 'master') {
                // Master routes: only master DB access
                req.db = {
                    master: db.master,
                    client: null
                };
            } else {
                // Client routes: full access with tenant
                req.db = db;
            }
            next();
        });

        // Register routes
        for (const RouteClass of routes) {
            const routeInstance = new RouteClass();
            const routeRouter = routeInstance.route();
            this.captureAndRegisterApis(routeRouter, productId, type);
            router.use(routeRouter);
        }

        return router;
    }

    /**
     * Capture routes and register APIs
     */
    private captureAndRegisterApis(router: express.Router, productId: string, type?: 'master' | 'client'): void {
        const stack = (router as any).stack || [];

        for (const layer of stack) {
            if (layer.route) {
                const { path, methods } = layer.route;
                const method = Object.keys(methods)[0]?.toUpperCase();

                if (method) {
                    const apiId = this.generateApiId(method, path);
                    const fullId = `${productId}.${apiId}`;

                    this.deps.apiRegistry.register({
                        id: fullId,
                        method,
                        path,
                        product: productId,
                        type: type || 'client',
                        tenant: type === 'client'
                    });

                    console.log(`   📝 API: ${fullId} (${method} ${path}) [${type || 'client'}]`);
                }
            }
        }
    }

    /**
     * Generate API ID from method and path
     */
    private generateApiId(method: string, path: string): string {
        let cleanPath = path.replace(/^\//, '').replace(/\//g, '.');

        if (!cleanPath) return method.toLowerCase();
        if (path.includes(':id')) {
            return cleanPath.replace(/:id\.?/g, '').replace(/\.$/, '') + '.get';
        }
        if (method === 'GET') {
            const parts = cleanPath.split('.');
            const lastPart = parts[parts.length - 1];
            if (lastPart.endsWith('s') && parts.length > 1) {
                return `${cleanPath}.list`;
            }
            return `${cleanPath}.get`;
        }
        if (method === 'POST') return `${cleanPath}.create`;
        if (method === 'PUT') return `${cleanPath}.update`;
        if (method === 'DELETE') return `${cleanPath}.delete`;

        return `${cleanPath}.${method.toLowerCase()}`;
    }

    /**
     * Get pool status for a product
     */
    getPoolStatus(productId: string): any {
        const product = this.deps.products.getProduct(productId);
        if (!product) return null;

        const roles = this.deps.products.getEnabledRoles(productId);
        const status: any = {
            productId,
            roles: {}
        };

        for (const role of roles) {
            const stats = this.deps.connectionManager?.getPoolStatsFor(productId, role);
            if (stats) {
                status.roles[role] = stats;
            }
        }

        return status;
    }

    /**
     * Log pool status for all products
     */
    logPoolStatus(): void {
        this.deps.connectionManager?.logPoolStatus();
    }
}