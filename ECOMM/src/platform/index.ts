// src/platform/index.ts

import { ConnectionManager } from './core/connection-manager';
import { ApiRegistry } from './core/api-registry';
import { TenantValidator } from './core/tenant-validator';
import { ContextBuilder } from './core/context-builder';
import { ApiContextMiddleware } from './adapters/express/middleware';

export { ConnectionManager } from './core/connection-manager';
export { ApiRegistry } from './core/api-registry';
export { TenantValidator } from './core/tenant-validator';
export { ContextBuilder } from './core/context-builder';
export { ApiContextMiddleware } from './adapters/express/middleware';

export type {
    ApiMethod,
    ApiRegistration,
    ApiMatch,
    RequestContext,
    DomainConfig,
    DatabaseConnectionConfig
} from './core/types';

/**
 * Platform - Self-contained module
 *
 * Initialize once and use throughout the app
 */
export class Platform {
    private static instance: Platform;

    public connectionManager: ConnectionManager;
    public apiRegistry: ApiRegistry;
    public tenantValidator: TenantValidator;
    public contextBuilder: ContextBuilder;
    public apiMiddleware: ApiContextMiddleware;

    private constructor() {
        // Initialize all platform components
        this.connectionManager = new ConnectionManager();
        this.apiRegistry = new ApiRegistry(this.connectionManager);
        this.tenantValidator = new TenantValidator(this.connectionManager);
        this.contextBuilder = new ContextBuilder(
            this.connectionManager,
            this.apiRegistry,
            this.tenantValidator
        );
        this.apiMiddleware = new ApiContextMiddleware(
            this.connectionManager,
            this.apiRegistry,
            this.contextBuilder
        );
    }

    /**
     * Get platform instance (singleton)
     */
    static getInstance(): Platform {
        if (!Platform.instance) {
            Platform.instance = new Platform();
        }
        return Platform.instance;
    }

    /**
     * Register APIs
     */
    registerAPIs(registrations: ApiRegistration[]): void {
        for (const api of registrations) {
            this.apiRegistry.register(api);
        }
    }

    /**
     * Get API registry
     */
    getApiRegistry(): ApiRegistry {
        return this.apiRegistry;
    }

    /**
     * Get connection manager
     */
    getConnectionManager(): ConnectionManager {
        return this.connectionManager;
    }

    /**
     * Close all connections
     */
    async close(): Promise<void> {
        await this.connectionManager.closeAll();
    }

    /**
     * Health check all domains
     */
    async healthCheck(): Promise<Record<string, boolean>> {
        const results: Record<string, boolean> = {};
        const domains = this.connectionManager.getDomains();

        for (const domain of domains) {
            results[domain] = await this.connectionManager.healthCheck(domain);
        }

        return results;
    }
}

// Convenience export
export default Platform;