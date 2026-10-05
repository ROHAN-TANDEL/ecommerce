// APIRegister.ts
import express from "express";

interface ApiConfig {
    id: string;
    method: string;
    path: string;
    domain: string;
    tenant: boolean;
}

export abstract class APIRegister {
    protected context: any;
    protected domain: string = 'default';
    protected tenant: boolean = true;
    protected routes: ApiConfig[] = [];

    constructor(context: any) {
        this.context = context;
    }

    // Abstract method that child classes must implement
    protected abstract registerRoutes(route: express.Router): void;

    // Register all captured APIs
    private registerApis() {
        for (const api of this.routes) {
            try {
                this.context.platform?.getApiRegistry().register(api);
            } catch (error) {
                console.warn(`Failed to register API ${api.id}:`, error);
            }
        }
    }

    // Main method to build and return the route
    public route(): express.Router {
        const router = express.Router();
        const self = this;

        // Create a proxy router to capture route registrations
        const captureRouter = express.Router();

        // Intercept route methods
        ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].forEach(method => {
            const original = (captureRouter as any)[method];
            (captureRouter as any)[method] = function(path: string, ...handlers: any[]) {
                // Generate API ID from path and method
                const apiId = self.generateApiId(path, method.toUpperCase());

                // Store route info
                self.routes.push({
                    id: `${self.domain}.${apiId}`,
                    method: method.toUpperCase(),
                    path: path,
                    domain: self.domain,
                    tenant: self.tenant
                });

                // Call original router method
                return original.call(this, path, ...handlers);
            };
        });

        // Let child class register its routes
        this.registerRoutes(captureRouter);

        // Register all captured APIs
        this.registerApis();

        // Use the captured router
        router.use(captureRouter);

        return router;
    }

    private generateApiId(path: string, method: string): string {
        // Clean the path: remove leading slash and replace / with .
        const cleanPath = path.replace(/^\//, '').replace(/\//g, '.');
        const methodLower = method.toLowerCase();

        // Handle root path
        if (!cleanPath) return methodLower;

        // Handle paths with :id parameter
        if (cleanPath.includes(':id')) {
            // For /users/:id -> users.get
            return cleanPath.replace(/:id\.?/g, '').replace(/\.$/, '') + '.get';
        }

        // For collections (GET without :id) -> users.list
        if (method === 'GET' && !path.includes(':')) {
            // Check if it's a collection (plural)
            const parts = cleanPath.split('.');
            const lastPart = parts[parts.length - 1];
            if (lastPart.endsWith('s') && parts.length > 1) {
                return `${cleanPath}.list`;
            }
            return `${cleanPath}.get`;
        }

        // For POST -> users.create
        if (method === 'POST') {
            return `${cleanPath}.create`;
        }

        // For PUT -> users.update
        if (method === 'PUT') {
            return `${cleanPath}.update`;
        }

        // For DELETE -> users.delete
        if (method === 'DELETE') {
            return `${cleanPath}.delete`;
        }

        // Default
        return `${cleanPath}.${methodLower}`;
    }

    // Helper method to set domain
    public setDomain(domain: string): this {
        this.domain = domain;
        return this;
    }

    // Helper method to set tenant
    public setTenant(tenant: boolean): this {
        this.tenant = tenant;
        return this;
    }
}