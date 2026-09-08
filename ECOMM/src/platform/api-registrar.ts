// src/platform/api-registrar.ts

import { ApiRegistry } from './core/registry/api-registry';
import { ApiRegistration, ApiMethod } from './core/registry/types';

export class ApiRegistrar {
    constructor(private readonly apiRegistry: ApiRegistry) {}

    /**
     * Register a single API
     */
    register(registration: ApiRegistration): void {
        this.apiRegistry.register(registration);
    }

    /**
     * Register multiple APIs at once
     */
    registerAll(registrations: ApiRegistration[]): void {
        for (const registration of registrations) {
            this.apiRegistry.register(registration);
        }
    }

    /**
     * Helper: Create GET API registration
     */
    get(id: string, path: string, domain: string, tenant: boolean = false): ApiRegistration {
        return { id, method: 'GET', path, domain, tenant };
    }

    /**
     * Helper: Create POST API registration
     */
    post(id: string, path: string, domain: string, tenant: boolean = false): ApiRegistration {
        return { id, method: 'POST', path, domain, tenant };
    }

    /**
     * Helper: Create PUT API registration
     */
    put(id: string, path: string, domain: string, tenant: boolean = false): ApiRegistration {
        return { id, method: 'PUT', path, domain, tenant };
    }

    /**
     * Helper: Create DELETE API registration
     */
    delete(id: string, path: string, domain: string, tenant: boolean = false): ApiRegistration {
        return { id, method: 'DELETE', path, domain, tenant };
    }

    /**
     * Helper: Create PATCH API registration
     */
    patch(id: string, path: string, domain: string, tenant: boolean = false): ApiRegistration {
        return { id, method: 'PATCH', path, domain, tenant };
    }
}