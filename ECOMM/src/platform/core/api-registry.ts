// src/platform/core/api-registry.ts

import type { ApiMethod, ApiRegistration, ApiMatch } from './types';
import { ConnectionManager } from './connection-manager';

interface RouteNode {
    static?: Map<string, RouteNode>;
    param?: RouteNode & { paramName: string };
    wildcard?: RouteNode;
    apis?: Map<ApiMethod, ApiRegistration>;
}

export class ApiRegistry {
    private readonly apis = new Map<string, ApiRegistration>();
    private readonly routeTrie = new RouteTrie();

    constructor(private readonly connectionManager: ConnectionManager) {}

    /**
     * Register an API
     */
    register(registration: ApiRegistration): void {
        if (this.apis.has(registration.id)) {
            throw new Error(`API already registered: ${registration.id}`);
        }

        // Validate domain exists
        this.connectionManager.getDomainConfig(registration.domain);

        // Store
        this.apis.set(registration.id, registration);
        this.routeTrie.insert(registration.path, registration);

        console.log(`{ success ::  API registered: ${registration.method} ${registration.path} → ${registration.id} }`);
    }

    /**
     * Get API by ID
     */
    get(apiId: string): ApiRegistration {
        const api = this.apis.get(apiId);
        if (!api) {
            throw new Error(`API not registered: ${apiId}`);
        }
        return api;
    }

    /**
     * Find API match by method and path
     */
    findMatch(method: ApiMethod, path: string): ApiMatch | null {
        return this.routeTrie.find(method, path);
    }

    /**
     * List all registered APIs
     */
    list(): ApiRegistration[] {
        return Array.from(this.apis.values());
    }
}

/**
 * Trie-based route matcher
 */
class RouteTrie {
    private root: RouteNode = {};

    insert(pattern: string, api: ApiRegistration): void {
        const segments = this.normalizePath(pattern).split('/').filter(Boolean);
        let node = this.root;

        for (const segment of segments) {
            if (segment.startsWith(':')) {
                if (!node.param) {
                    node.param = { paramName: segment.slice(1) };
                }
                node = node.param;
            } else if (segment === '*') {
                if (!node.wildcard) {
                    node.wildcard = {};
                }
                node = node.wildcard;
            } else {
                if (!node.static) {
                    node.static = new Map();
                }
                if (!node.static.has(segment)) {
                    node.static.set(segment, {});
                }
                node = node.static.get(segment)!;
            }
        }

        if (!node.apis) {
            node.apis = new Map();
        }
        if (node.apis.has(api.method)) {
            throw new Error(`Duplicate route: ${api.method} ${pattern}`);
        }
        node.apis.set(api.method, api);
    }

    find(method: ApiMethod, path: string): ApiMatch | null {
        const segments = this.normalizePath(path).split('/').filter(Boolean);
        const params: Record<string, string> = {};
        const result = this._find(this.root, segments, 0, params);

        if (!result?.apis) return null;

        const api = result.apis.get(method);
        if (!api) return null;

        return { api, params };
    }

    private _find(
        node: RouteNode,
        segments: string[],
        index: number,
        params: Record<string, string>
    ): RouteNode | null {
        if (index === segments.length) {
            return (node.apis && node.apis.size > 0) ? node : null;
        }

        const segment = segments[index];

        // Static match (highest priority)
        if (node.static) {
            const staticNode = node.static.get(segment);
            if (staticNode) {
                const result = this._find(staticNode, segments, index + 1, params);
                if (result) return result;
            }
        }

        // Parameter match
        if (node.param) {
            const result = this._find(node.param, segments, index + 1, params);
            if (result) {
                if (node.param.paramName && !params[node.param.paramName]) {
                    params[node.param.paramName] = segment;
                }
                return result;
            }
        }

        // Wildcard match
        if (node.wildcard) {
            if (node.wildcard.apis && node.wildcard.apis.size > 0) {
                params['*'] = segments.slice(index).join('/');
                return node.wildcard;
            }
            const result = this._find(node.wildcard, segments, index + 1, params);
            if (result) return result;
        }

        return null;
    }

    private normalizePath(path: string): string {
        return path.replace(/\/+$/, '') || '/';
    }
}