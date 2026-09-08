// src/platform/factory.ts

import { Database } from '../infra/database/pgsql';
import { DomainAdapter } from './domain-adapter';
import { ApiRegistry } from './core/registry/api-registry';
import { TenantValidator } from './core/context/tenant-validator';
import { RequestContextBuilder } from './core/context/context-builder';
import { ApiContextMiddleware } from './adapters/express/api-context-middleware';
import { ApiErrorHandler } from './core/error/error-handler';

export interface PlatformComponents {
    apiRegistry: ApiRegistry;
    tenantValidator: TenantValidator;
    contextBuilder: RequestContextBuilder;
    apiMiddleware: ApiContextMiddleware;
    errorHandler: ApiErrorHandler;
    domainAdapter: DomainAdapter;
}

/**
 * PlatformFactory
 *
 * Creates all platform components using your existing Database
 * WITHOUT modifying any existing code.
 */
export class PlatformFactory {
    private static instance: PlatformFactory;
    private components: PlatformComponents | null = null;

    private constructor() {}

    static getInstance(): PlatformFactory {
        if (!PlatformFactory.instance) {
            PlatformFactory.instance = new PlatformFactory();
        }
        return PlatformFactory.instance;
    }

    /**
     * Initialize platform with your existing Database
     */
    initialize(database: Database): PlatformComponents {
        if (this.components) {
            return this.components;
        }

        // 1. Create domain adapter (wraps your existing Database)
        const domainAdapter = new DomainAdapter(database);

        // 2. Create platform components
        const apiRegistry = new ApiRegistry(domainAdapter);
        const tenantValidator = new TenantValidator(domainAdapter);
        const contextBuilder = new RequestContextBuilder(apiRegistry, tenantValidator);
        const apiMiddleware = new ApiContextMiddleware(apiRegistry, contextBuilder);
        const errorHandler = new ApiErrorHandler();

        this.components = {
            apiRegistry,
            tenantValidator,
            contextBuilder,
            apiMiddleware,
            errorHandler,
            domainAdapter
        };

        return this.components;
    }

    /**
     * Get platform components (must be initialized first)
     */
    getComponents(): PlatformComponents {
        if (!this.components) {
            throw new Error('Platform not initialized. Call initialize() first.');
        }
        return this.components;
    }
}

// Convenience export
export const platform = PlatformFactory.getInstance();