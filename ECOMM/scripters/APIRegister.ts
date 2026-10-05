// src/platform/routebind/RouteBinder.ts
import express from 'express';
import { PlatformContext } from '../context.js';

export interface RouteInfo {
    method: string;
    path: string;
    handler: Function;
    middlewares?: Function[];
}

export interface ProductContext {
    productId: string;
    db: any;
}

export class RouteBinder {
    constructor(private platform: PlatformContext) {}

    /**
     * Bind multiple route classes to a product
     * Returns a router with all routes attached
     */
    bind(routes: any[], productId: string): express.Router {
        // Validate product exists
        this.platform.registry.validateProduct(productId);

        // Get database access for this product
        const db = this.platform.getDatabase(productId);

        // Create main router
        const mainRouter = express.Router();

        // Middleware to attach db to all requests
        mainRouter.use((req: any, res: any, next: any) => {
            req.productId = productId;
            req.db = db;
            next();
        });

        // Register all routes
        for (const RouteClass of routes) {
            const routeInstance = new RouteClass();
            const routeRouter = routeInstance.route();

            // Capture routes for API registration
            this.captureAndRegisterApis(routeRouter, productId);

            // Mount route
            mainRouter.use(routeRouter);
        }

        return mainRouter;
    }

    /**
     * Bind a single route class to a product
     */
    bindOne(RouteClass: any, productId: string): express.Router {
        return this.bind([RouteClass], productId);
    }

    /**
     * Capture routes and register APIs
     */
    private captureAndRegisterApis(router: express.Router, productId: string): void {
        const routes: RouteInfo[] = [];
        const methods = ['get', 'post', 'put', 'delete', 'patch'];

        // Intercept route registrations
        for (const method of methods) {
            const original = (router as any)[method];

            (router as any)[method] = function(path: string, ...handlers: any[]) {
                routes.push({
                    method: method.toUpperCase(),
                    path,
                    handler: handlers[handlers.length - 1],
                    middlewares: handlers.slice(0, -1)
                });

                return original.call(this, path, ...handlers);
            };
        }

        // Restore original methods (we don't want to keep intercepting)
        // Actually, we need to call route() to trigger the interceptors
        // But route() was already called in bind()
        // So we need to extract routes differently

        // Rebuild routes from the router's stack
        this.extractRoutesFromRouter(router, productId);
    }

    private extractRoutesFromRouter(router: express.Router, productId: string): void {
        // Get the router's stack
        const stack = (router as any).stack || [];

        for (const layer of stack) {
            if (layer.route) {
                const { path, methods, stack: routeStack } = layer.route;
                const method = Object.keys(methods)[0]?.toUpperCase();

                if (method) {
                    const apiId = this.generateApiId(method, path);
                    const fullId = `${productId}.${apiId}`;

                    this.platform.registry.registerApi({
                        id: fullId,
                        method,
                        path,
                        product: productId,
                        tenant: false
                    });
                }
            }
        }
    }

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
}