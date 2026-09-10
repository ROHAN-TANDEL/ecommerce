// src/platform/routebind/RouteBinder.ts
import express from 'express';
import { TenantMiddleware, type TenantMiddlewareDeps } from '../middleware/TenantMiddleware.js';

export interface RouteInfo {
    method: string;
    path: string;
    handler: Function;
    middlewares?: Function[];
}

export interface RouteBinderDependencies extends TenantMiddlewareDeps {
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
        this.tenantMiddleware = new TenantMiddleware(deps);
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

            console.log(`\n📦 The Registering product: ${product.id}`);

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

        // 1. Attach product + route type context
        router.use((req: any, res: any, next: any) => {
            req.productId = productId;
            req.routeType = type;
            next();
        });

        // 2. API identification — match incoming request against the registry.
        //    req.api is set here so everything downstream (middleware, controllers)
        //    can read which registered API this request maps to.
        //    Note: registry is populated AFTER bindRoutes returns (routes are registered
        //    below), so we identify lazily at request time, not at setup time.
        router.use((req: any, res: any, next: any) => {
            const matched = this.deps.apiRegistry.match(req.method, req.path);
            if (matched) {
                req.api = matched;
            }
            // Missing match is not a hard error here — unregistered routes will simply
            // have req.api = undefined and will fall through to Express 404 naturally.
            next();
        });

        // 3. Tenant enforcement based on route type
        if (type === 'client') {
            router.use((req: any, res: any, next: any) => {
                req.requiresTenant = true;
                next();
            });
            router.use(this.tenantMiddleware.resolve);
            router.use(this.tenantMiddleware.validate);
        } else {
            router.use((req: any, res: any, next: any) => {
                req.requiresTenant = false;
                req.tenant = null;
                req.tenantId = null;
                next();
            });
        }

        // 4. Attach database access based on type
        router.use((req: any, res: any, next: any) => {
            if (type === 'master') {
                req.db = new Proxy({}, {
                    get: (_t, prop: string | symbol) => {
                        if (prop === 'master') return db.get('master');
                        if (prop === 'client') return null;
                        return undefined;
                    }
                });
            } else {
                // Client routes: tenant middleware has already replaced req.db
                // with the tenant-scoped accessor. This is a safe fallback only.
                req.db = db;
            }
            next();
        });

        // 5. Register actual Express route handlers
        for (const RouteClass of routes) {
            const routeInstance = new RouteClass();
            const routeRouter = routeInstance.route();
            this.captureAndRegisterApis(routeRouter, productId, type);
            router.use(routeRouter);
        }

        return router;
    }

    /**
     * Capture routes and register APIs.
     * Stores the Express-compiled layer.regexp so the ApiRegistry can match
     * real incoming paths (e.g. /users/123) against pattern paths (e.g. /users/:id)
     * at request time without re-implementing Express routing.
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

                    // layer.route.regexp is the Express-compiled regexp for this exact path.
                    // Storing it lets ApiRegistry.match() do accurate param-aware matching.
                    const regexp: RegExp | undefined = layer.route.regexp ?? layer.regexp;

                    this.deps.apiRegistry.register({
                        id: fullId,
                        method,
                        path,
                        product: productId,
                        type: type || 'client',
                        tenant: type === 'client',
                        regexp,
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