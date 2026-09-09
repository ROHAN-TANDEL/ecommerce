// src/platform/registry/ApiRegistry.ts

export interface ApiRegistration {
    id: string;
    method: string;
    path: string;
    product: string;
    type?: 'master' | 'client';
    tenant?: boolean;
}

export class ApiRegistry {
    private apis: Map<string, ApiRegistration> = new Map();

    register(api: ApiRegistration): void {
        if (this.apis.has(api.id)) {
            console.warn(`⚠️ API ${api.id} already registered, skipping...`);
            return;
        }

        this.apis.set(api.id, api);
    }

    getById(id: string): ApiRegistration | undefined {
        return this.apis.get(id);
    }

    getAll(): ApiRegistration[] {
        return Array.from(this.apis.values());
    }

    getByProduct(productId: string): ApiRegistration[] {
        return this.getAll().filter(api => api.product === productId);
    }

    getByType(type: 'master' | 'client'): ApiRegistration[] {
        return this.getAll().filter(api => api.type === type);
    }

    getTenantApis(): ApiRegistration[] {
        return this.getAll().filter(api => api.tenant === true);
    }

    getNonTenantApis(): ApiRegistration[] {
        return this.getAll().filter(api => api.tenant === false);
    }
}