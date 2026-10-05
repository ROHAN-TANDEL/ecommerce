// src/platform/config/ProductConfig.ts
import productsData from './products.json' assert { type: 'json' };

export interface PoolConfig {
    maxConnections: number;        // Maximum connections in pool
    idleTimeout: number;           // Close idle connections after (ms)
    connectionTimeout: number;     // Connection timeout (ms)
    maxUses: number;               // Close connections after N uses
    keepAlive: boolean;            // Send keepalive pings
    keepAliveInitialDelay: number; // Initial delay for keepalive
    statementTimeout: number;      // Statement timeout (ms)
    queryTimeout: number;          // Query timeout (ms)
}

// export interface DatabaseConfig {
//     host: string;
//     port: number;
//     database: string;
//     user: string;
//     password: string;
//     maxConnections?: number;
//     idleTimeout?: number;
// }
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    schema?: string;        // For master schema (e.g., 'public')
    user: string;
    password: string;
    pool: PoolConfig;
}

export interface RoleConfig {
    enabled: boolean;
    database: DatabaseConfig | null;
    // For client: schema is resolved from tenant
    // For master: schema can be fixed (public) or configurable
}

export interface RouteConfig {
    client: string[];
    master: string[];
}

export interface ProductDefinition {
    id: string;
    name: string;
    enabled: boolean;
    routes: RouteConfig;
    roles: Record<string, RoleConfig>;
    defaultTenant?: string;
    metadata?: Record<string, any>;
    tags?: string[];
}

//
// export interface ProductDefinition {
//     id: string;
//     name: string;
//     enabled: boolean;
//     routes: string[];
//     roles: Record<string, RoleConfig>;  // Dynamic roles - additive!
//     metadata?: Record<string, any>;     // Optional metadata
//     tags?: string[];                    // Optional tags for grouping
// }

// Default pool configuration
export const defaultPoolConfig: PoolConfig = {
    maxConnections: 20,
    idleTimeout: 30000,
    connectionTimeout: 5000,
    maxUses: 7500,
    keepAlive: true,
    keepAliveInitialDelay: 10000,
    statementTimeout: 30000,
    queryTimeout: 30000
};

export class ProductConfig {
    private products: Map<string, ProductDefinition> = new Map();
    private routeToProductMap: Map<string, { productId: string; type: 'master' | 'client' }> = new Map();

    constructor() {
        this.loadProducts(productsData.products);
        this.buildRouteMapping();
    }

    private buildRouteMapping(): void {
        for (const [productId, product] of this.products) {
            // Client routes
            for (const routeName of product.routes.client) {
                this.routeToProductMap.set(routeName, { productId, type: 'client' });
            }
            // Master routes
            for (const routeName of product.routes.master) {
                this.routeToProductMap.set(routeName, { productId, type: 'master' });
            }
        }
    }

    private loadProducts(products: ProductDefinition[]): void {
        console.log('\n📦 Loading products with route types...');

        for (const product of products) {
            if (product.enabled) {
                this.products.set(product.id, product);
                console.log(`✅ Product registered: ${product.id}`);
                console.log(`   Client Routes: ${product.routes.client.join(', ')}`);
                console.log(`   Master Routes: ${product.routes.master.join(', ')}`);

                const enabledRoles = Object.keys(product.roles).filter(
                    role => product.roles[role].enabled
                );
                console.log(`   Roles: ${enabledRoles.join(', ')}`);
            }
        }
    }

    getPoolConfig(productId: string, role: string): PoolConfig | null {
        const config = this.getRoleConfig(productId, role);
        if (!config) return null;
        return config.pool || defaultPoolConfig;
    }

    private loadProducts(products: ProductDefinition[]): void {
        console.log('\n📦 Loading products with additive databases...');

        for (const product of products) {
            if (product.enabled) {
                this.products.set(product.id, product);
                console.log(`✅ Product registered: ${product.id}`);
                //todo check why commented
                //console.log(`   Routes: ${product?.routes?.join(', ')}`);

                const enabledRoles = Object.keys(product.roles).filter(
                    role => product.roles[role].enabled
                );
                console.log(`   Roles: ${enabledRoles.join(', ')}`);
            }
        }
    }

    private buildRouteMapping(): void {
        for (const [productId, product] of this.products) {

            console.log('iterable - ');
            console.log(product.routes);
            for (const routeName of product.routes.client) {
                this.routeToProductMap.set(routeName, productId);
            }
            for (const routeName of product.routes.master) {
                this.routeToProductMap.set(routeName, productId);
            }
        }
    }

    /**
     * Get all products
     */
    getProduct(id: string): ProductDefinition | undefined {
        return this.products.get(id);
    }

    /**
     * Get all enabled products
     */
    getEnabledProducts(): ProductDefinition[] {
        return Array.from(this.products.values()).filter(p => p.enabled);
    }

    getRouteInfo(routeName: string): { productId: string; type: 'master' | 'client' } | undefined {
        return this.routeToProductMap.get(routeName);
    }

    getClientRoutes(productId: string): string[] {
        const product = this.getProduct(productId);
        return product?.routes.client || [];
    }

    getAllRoutes(productId: string): { client: string[]; master: string[] } {
        const product = this.getProduct(productId);
        return {
            client: product?.routes.client || [],
            master: product?.routes.master || []
        };
    }

    isClientRoute(routeName: string): boolean {
        const info = this.routeToProductMap.get(routeName);
        return info?.type === 'client';
    }

    isMasterRoute(routeName: string): boolean {
        const info = this.routeToProductMap.get(routeName);
        return info?.type === 'master';
    }

    getMasterRoutes(productId: string): string[] {
        const product = this.getProduct(productId);
        return product?.routes.master || [];
    }

    /**
     * Add a new product dynamically (runtime addition)
     */
    addProduct(product: ProductDefinition): void {
        if (this.products.has(product.id)) {
            console.warn(`Product ${product.id} already exists, updating...`);
        }

        this.products.set(product.id, product);

        // Update route mapping
        for (const routeName of product.routes) {
            this.routeToProductMap.set(routeName, product.id);
        }

        console.log(`✅ Product added dynamically: ${product.id}`);
    }

    /**
     * Add a new role to an existing product dynamically
     */
    addRole(productId: string, roleName: string, roleConfig: RoleConfig): void {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product "${productId}" not found`);
        }

        product.roles[roleName] = roleConfig;
        console.log(`✅ Role "${roleName}" added to product "${productId}"`);
    }

    /**
     * Enable/disable a role dynamically
     */
    setRoleEnabled(productId: string, roleName: string, enabled: boolean): void {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product "${productId}" not found`);
        }

        if (!product.roles[roleName]) {
            throw new Error(`Role "${roleName}" not found in product "${productId}"`);
        }

        product.roles[roleName].enabled = enabled;
        console.log(`✅ Role "${roleName}" ${enabled ? 'enabled' : 'disabled'} for product "${productId}"`);
    }

    /**
     * Get all roles for a product
     */
    getRoles(productId: string): string[] {
        const product = this.getProduct(productId);
        if (!product) return [];
        return Object.keys(product.roles);
    }

    /**
     * Get enabled roles for a product
     */
    getEnabledRoles(productId: string): string[] {
        const product = this.getProduct(productId);
        if (!product) return [];
        return Object.keys(product.roles).filter(role => product.roles[role].enabled);
    }

    /**
     * Check if a role is enabled
     */
    isRoleEnabled(productId: string, role: string): boolean {
        const product = this.getProduct(productId);
        return product?.roles[role]?.enabled || false;
    }

    /**
     * Get role configuration
     */
    getRoleConfig(productId: string, role: string): DatabaseConfig | null {
        const product = this.getProduct(productId);
        return product?.roles[role]?.database || null;
    }

    /**
     * Get product by route name
     */
    getProductByRoute(routeName: string): string | undefined {
        return this.routeToProductMap.get(routeName);
    }

    /**
     * Get all products with metadata
     */
    getProductsWithMetadata(): ProductDefinition[] {
        return Array.from(this.products.values());
    }

    /**
     * Get products by tag
     */
    getProductsByTag(tag: string): ProductDefinition[] {
        return Array.from(this.products.values()).filter(
            product => product.tags?.includes(tag)
        );
    }

    /**
     * Validate product exists
     */
    hasProduct(id: string): boolean {
        return this.products.has(id);
    }

    /**
     * Get all route mappings
     */
    getRouteMappings(): Map<string, string> {
        return new Map(this.routeToProductMap);
    }

    hasProduct(id: string): boolean {
        return this.products.has(id);
    }

    getRoles(productId: string): string[] {
        const product = this.getProduct(productId);
        if (!product) return [];
        return Object.keys(product.roles);
    }

    isRoleEnabled(productId: string, role: string): boolean {
        const product = this.getProduct(productId);
        return product?.roles[role]?.enabled || false;
    }

    getRoleConfig(productId: string, role: string): DatabaseConfig | null {
        const product = this.getProduct(productId);
        return product?.roles[role]?.database || null;
    }

    getEnabledRoles(productId: string): string[] {
        const product = this.getProduct(productId);
        if (!product) return [];
        return Object.keys(product.roles).filter(role => product.roles[role].enabled);
    }

    /**
     * Log current configuration
     */
    logConfig(): void {
        console.log('\n📋 Current Product Configuration:');
        console.log('─'.repeat(60));

        for (const [id, product] of this.products) {
            console.log(`\n${id}:`);
            console.log(`  Name: ${product.name}`);
            console.log(`  Enabled: ${product.enabled}`);
            //todo - console.log(`  Routes: ${product.routes.join(', ')}`);
            console.log(`  Roles:`);

            for (const [role, config] of Object.entries(product.roles)) {
                const status = config.enabled ? '✅' : '❌';
                const db = config.database ? config.database.database : 'none';
                console.log(`    ${status} ${role}: ${db}`);
            }

            if (product.tags) {
                console.log(`  Tags: ${product.tags.join(', ')}`);
            }
        }
        console.log('─'.repeat(60));
    }
}