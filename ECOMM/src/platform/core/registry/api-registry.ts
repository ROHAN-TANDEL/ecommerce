import { ApiMethod, ApiRegistration, ApiMatch, DatabaseInterface } from './types';
import { RouteTrie } from './route-matcher';

export class ApiRegistry {
    private readonly apis = new Map<string, ApiRegistration>();
    private readonly routeTrie = new RouteTrie();
    private readonly methodIndex = new Map<ApiMethod, string[]>();

    constructor(private readonly database: DatabaseInterface) {}

    register(registration: ApiRegistration): void {
        if (this.apis.has(registration.id)) {
            throw new Error(`API already registered: ${registration.id}`);
        }

        // Validate domain exists and is enabled
        this.database.domain(registration.domain);

        // Store in map
        this.apis.set(registration.id, registration);

        // Index by method for faster lookups
        if (!this.methodIndex.has(registration.method)) {
            this.methodIndex.set(registration.method, []);
        }
        this.methodIndex.get(registration.method)!.push(registration.id);

        // Insert into trie for route matching
        this.routeTrie.insert(registration.path, registration);
    }

    get(apiId: string): ApiRegistration {
        const api = this.apis.get(apiId);
        if (!api) {
            throw new Error(`API not registered: ${apiId}`);
        }
        return api;
    }

    findMatch(method: ApiMethod, path: string): ApiMatch | null {
        return this.routeTrie.find(method, path);
    }

    list(): ApiRegistration[] {
        return Array.from(this.apis.values());
    }

    listByMethod(method: ApiMethod): ApiRegistration[] {
        const ids = this.methodIndex.get(method) || [];
        return ids.map(id => this.apis.get(id)!).filter(Boolean);
    }

    getMetrics() {
        return {
            totalRoutes: this.apis.size,
            routesByMethod: Object.fromEntries(
                Array.from(this.methodIndex.entries()).map(([method, ids]) => [method, ids.length])
            ),
            allRoutes: this.routeTrie.getAllRoutes()
        };
    }

    // Debug: Print trie structure
    printRoutes(): void {
        this.routeTrie.print();
    }
}