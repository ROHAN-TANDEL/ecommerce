import { ApiMethod, ApiRegistration, ApiMatch } from './types';

interface RouteNode {
    static?: Map<string, RouteNode>;
    param?: RouteNode & { paramName: string };
    wildcard?: RouteNode;
    apis?: Map<ApiMethod, ApiRegistration>;
}

export class RouteTrie {
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

        // 1. Static match (highest priority)
        if (node.static) {
            const staticNode = node.static.get(segment);
            if (staticNode) {
                const result = this._find(staticNode, segments, index + 1, params);
                if (result) return result;
            }
        }

        // 2. Parameter match
        if (node.param) {
            const result = this._find(node.param, segments, index + 1, params);
            if (result) {
                if (node.param.paramName && !params[node.param.paramName]) {
                    params[node.param.paramName] = segment;
                }
                return result;
            }
        }

        // 3. Wildcard match (lowest priority)
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

    // Debug: Get all registered routes
    getAllRoutes(): Array<{ method: ApiMethod; path: string; api: ApiRegistration }> {
        const routes: Array<{ method: ApiMethod; path: string; api: ApiRegistration }> = [];
        this._collectRoutes(this.root, '', routes);
        return routes;
    }

    private _collectRoutes(
        node: RouteNode,
        currentPath: string,
        routes: Array<{ method: ApiMethod; path: string; api: ApiRegistration }>
    ): void {
        if (node.apis) {
            for (const [method, api] of node.apis) {
                routes.push({
                    method,
                    path: currentPath || '/',
                    api
                });
            }
        }

        if (node.static) {
            for (const [segment, child] of node.static) {
                const path = currentPath + '/' + segment;
                this._collectRoutes(child, path, routes);
            }
        }

        if (node.param) {
            const path = currentPath + '/:' + node.param.paramName;
            this._collectRoutes(node.param, path, routes);
        }

        if (node.wildcard) {
            const path = currentPath + '/*';
            this._collectRoutes(node.wildcard, path, routes);
        }
    }

    // Debug: Print the trie structure
    print(): void {
        console.log('{Route Trie Structure:}');
        this._printNode(this.root, 0);
    }

    private _printNode(node: RouteNode, depth: number): void {
        const indent = '  '.repeat(depth);

        if (node.apis) {
            console.log(`{${indent} APIs:}`, Array.from(node.apis.keys()).join(', '));
        }

        if (node.static) {
            for (const [segment, child] of node.static) {
                console.log(`{${indent}📁 /${segment}}`);
                this._printNode(child, depth + 1);
            }
        }

        if (node.param) {
            console.log(`{${indent} /:${node.param.paramName}}`);
            this._printNode(node.param, depth + 1);
        }

        if (node.wildcard) {
            console.log(`{${indent} /*}`);
            this._printNode(node.wildcard, depth + 1);
        }
    }
}