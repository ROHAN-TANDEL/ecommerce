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
    user: string;
    password: string;
    pool: PoolConfig;              // Pool configuration
}

export interface RoleConfig {
    enabled: boolean;
    database: DatabaseConfig | null;
}

export interface ProductDefinition {
    id: string;
    name: string;
    enabled: boolean;
    routes: string[];
    roles: Record<string, RoleConfig>;
}

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

    constructor() {
        this.loadProducts(productsData.products);
    }

    getPoolConfig(productId: string, role: string): PoolConfig | null {
        const config = this.getRoleConfig(productId, role);
        if (!config) return null;
        return config.pool || defaultPoolConfig;
    }

    private loadProducts(products: ProductDefinition[]): void {
        console.log('\n📦 Loading products...');
        for (const product of products) {
            if (product.enabled) {
                this.products.set(product.id, product);
                console.log(`✅ Product registered: ${product.id}`);
                console.log(`   Routes: ${product.routes.join(', ')}`);
                console.log(`   Roles: ${Object.keys(product.roles).join(', ')}`);
            }
        }
    }

    getProduct(id: string): ProductDefinition | undefined {
        return this.products.get(id);
    }

    getEnabledProducts(): ProductDefinition[] {
        return Array.from(this.products.values()).filter(p => p.enabled);
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
}