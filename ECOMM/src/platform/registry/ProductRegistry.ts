import { ProductDefinition, ProductConfig } from '../config/ProductConfig.js';

export interface RegisteredProduct {
    id: string;
    name: string;
    hasMaster: boolean;
    hasClient: boolean;
}

export class ProductRegistry {
    private products: Map<string, RegisteredProduct> = new Map();

    constructor(private productConfig: ProductConfig) {
        this.registerProducts();
    }

    private registerProducts(): void {
        const enabledProducts = this.productConfig.getEnabledProducts();

        for (const product of enabledProducts) {
            this.products.set(product.id, {
                id: product.id,
                name: product.name,
                hasMaster: product.master.enabled,
                hasClient: product.client.enabled
            });

            console.log(`📦 Product registered: ${product.id} (Master: ${product.master.enabled}, Client: ${product.client.enabled})`);
        }
    }

    getProduct(id: string): RegisteredProduct | undefined {
        return this.products.get(id);
    }

    hasProduct(id: string): boolean {
        return this.products.has(id);
    }

    getAllProducts(): RegisteredProduct[] {
        return Array.from(this.products.values());
    }

    getProductsWithMaster(): RegisteredProduct[] {
        return Array.from(this.products.values()).filter(p => p.hasMaster);
    }

    getProductsWithClient(): RegisteredProduct[] {
        return Array.from(this.products.values()).filter(p => p.hasClient);
    }

    validateProduct(productId: string): void {
        if (!this.hasProduct(productId)) {
            throw new Error(`Product "${productId}" is not registered or enabled`);
        }
    }
}