// src/platform/config/ProductConfig.ts
import productsData from './products.json' assert { type: 'json' };

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    maxConnections?: number;
    idleTimeout?: number;
}

export interface ProductRoleConfig {
    enabled: boolean;
    database: DatabaseConfig | null;
}

export interface ProductDefinition {
    id: string;
    name: string;
    enabled: boolean;
    routes: string[]; // Route class names to auto-register
    master: ProductRoleConfig;
    client: ProductRoleConfig;
}

export class ProductConfig {
    private products: Map<string, ProductDefinition> = new Map();
    private routeToProductMap: Map<string, string> = new Map();

    constructor() {
        this.loadProducts(productsData.products);
        this.buildRouteMapping();
    }

    private loadProducts(products: ProductDefinition[]): void {
        for (const product of products) {
            if (product.enabled) {
                this.products.set(product.id, product);
                console.log(`✅ Product registered: ${product.id}`);
                console.log(`   Routes: ${product.routes.join(', ')}`);
            }
        }
    }

    private buildRouteMapping(): void {
        for (const [productId, product] of this.products) {
            for (const routeName of product.routes) {
                this.routeToProductMap.set(routeName, productId);
                console.log(`   📍 ${routeName} → ${productId}`);
            }
        }
    }

    getProduct(id: string): ProductDefinition | undefined {
        return this.products.get(id);
    }

    getEnabledProducts(): ProductDefinition[] {
        return Array.from(this.products.values()).filter(p => p.enabled);
    }

    getProductByRoute(routeName: string): string | undefined {
        return this.routeToProductMap.get(routeName);
    }

    getRoutesForProduct(productId: string): string[] {
        const product = this.getProduct(productId);
        return product?.routes || [];
    }

    hasProduct(id: string): boolean {
        return this.products.has(id);
    }

    isMasterEnabled(productId: string): boolean {
        const product = this.getProduct(productId);
        return product?.master.enabled || false;
    }

    isClientEnabled(productId: string): boolean {
        const product = this.getProduct(productId);
        return product?.client.enabled || false;
    }

    getMasterConfig(productId: string): DatabaseConfig | null {
        const product = this.getProduct(productId);
        return product?.master.database || null;
    }

    getClientConfig(productId: string): DatabaseConfig | null {
        const product = this.getProduct(productId);
        return product?.client.database || null;
    }

    getAllRouteMappings(): Map<string, string> {
        return new Map(this.routeToProductMap);
    }
}