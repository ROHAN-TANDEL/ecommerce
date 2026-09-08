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
}

export class RouteBinder {

    private tenantMiddleware: TenantMiddleware;

    constructor(deps: RouteBinderDependencies, routeModules: Map<string, any>) {
        this.deps = deps;
        this.routeModules = routeModules;
        this.tenantMiddleware = new TenantMiddleware(deps as any);
    }

    /**
     * Auto-register all routes from configuration
     */
    autoRegister(): express.Router {
        const mainRouter = express.Router();
        const enabledProducts = this.deps.products.getEnabledProducts();

        console.log('\n🚀 Auto-registering routes...');

        for (const product of enabledProducts) {
            console.log(`\n📦 Registering product: ${product.id}`);

            const routeClasses = this.getRouteClasses(product.routes);

            if (routeClasses.length === 0) {
                console.log(`   ⚠️ No routes found for ${product.id}`);
                continue;
            }

            const productRouter = this.bindRoutes(routeClasses, product.id);
            mainRouter.use(productRouter);

            console.log(`   ✅ Registered ${routeClasses.length} routes for ${product.id}`);
            console.log(`   📊 Available roles: ${this.deps.products.getEnabledRoles(product.id).join(', ')}`);
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

        const routeClasses = this.getRouteClasses(product.routes);
        return this.bindRoutes(routeClasses, productId);
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

    private bindRoutes(routes: any[], productId: string): express.Router {
        this.deps.registry.validateProduct(productId);
        const db = this.deps.getDatabase(productId);
        const router = express.Router();

        // Attach product context
        router.use((req: any, res: any, next: any) => {
            req.productId = productId;
            req.db = db;
            req.requiresTenant = true; // Default: requires tenant
            next();
        });

        // Add tenant resolution middleware
        router.use(this.tenantMiddleware.resolve);
        router.use(this.tenantMiddleware.validate);

        // Register routes
        for (const RouteClass of routes) {
            const routeInstance = new RouteClass();
            const routeRouter = routeInstance.route();
            this.captureAndRegisterApis(routeRouter, productId);
            router.use(routeRouter);
        }

        return router;
    }

    // /**
    //  * Bind routes to a product
    //  */
    // private bindRoutes(routes: any[], productId: string): express.Router {
    //     // Validate product exists
    //     this.deps.registry.validateProduct(productId);
    //
    //     // Get database access for this product
    //     const db = this.deps.getDatabase(productId);
    //
    //     // Create router for this product
    //     const router = express.Router();
    //
    //     // Middleware to attach db and product context to all requests
    //     router.use((req: any, res: any, next: any) => {
    //         req.productId = productId;
    //         req.db = db; // This will have dynamic properties via proxy
    //         next();
    //     });
    //
    //     // Register all routes
    //     for (const RouteClass of routes) {
    //         const routeInstance = new RouteClass();
    //         const routeRouter = routeInstance.route();
    //
    //         // Capture routes for API registration
    //         this.captureAndRegisterApis(routeRouter, productId);
    //
    //         // Mount route
    //         router.use(routeRouter);
    //     }
    //
    //     return router;
    // }

    /**
     * Capture routes and register APIs
     */
    private captureAndRegisterApis(router: express.Router, productId: string): void {
        // Get the router's stack
        const stack = (router as any).stack || [];

        for (const layer of stack) {
            if (layer.route) {
                const { path, methods, stack: routeStack } = layer.route;
                const method = Object.keys(methods)[0]?.toUpperCase();

                if (method) {
                    const apiId = this.generateApiId(method, path);
                    const fullId = `${productId}.${apiId}`;

                    this.deps.apiRegistry.register({
                        id: fullId,
                        method,
                        path,
                        product: productId,
                        tenant: false
                    });

                    console.log(`   📝 API: ${fullId} (${method} ${path})`);
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