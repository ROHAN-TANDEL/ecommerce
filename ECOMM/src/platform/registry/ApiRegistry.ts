// src/platform/registry/ApiRegistry.ts

export interface ApiRegistration {
    id: string;
    method: string;
    path: string;
    product: string;
    type?: 'master' | 'client';
    tenant?: boolean;
    /** Express-compiled regexp for matching incoming request paths at runtime. */
    regexp?: RegExp;
}

export interface MatchedApi {
    registration: ApiRegistration;
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

    /**
     * Match an incoming request (method + path) against all registered APIs.
     *
     * Uses the Express-compiled regexp stored at registration time, so
     * /users/123 correctly matches /users/:id without any custom parsing.
     *
     * Returns the first matching registration, or undefined.
     */
    match(method: string, requestPath: string): ApiRegistration | undefined {
        const upperMethod = method.toUpperCase();

        for (const api of this.apis.values()) {
            if (api.method !== upperMethod) continue;

            if (api.regexp) {
                // Fast path — use pre-compiled regexp from Express layer
                if (api.regexp.test(requestPath)) return api;
            } else {
                // Fallback — exact string match (no params in path)
                if (api.path === requestPath) return api;
            }
        }

        return undefined;
    }
}