// src/modules/products/types/productTypes.ts
export interface Product {
    id: string;
    sku: string;
    category_id: string;
    name: string;
    description: string;
    price: string;
    stock_quantity: number;
    status: string;
    version: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateProductData {
    sku: string;
    category_id: string;
    name: string;
    description: string;
    price: string;
    stock_quantity: number;
    status?: string;
}

export interface UpdateProductData {
    sku?: string;
    category_id?: string;
    name?: string;
    description?: string;
    price?: string;
    stock_quantity?: number;
    status?: string;
}

export interface ProductListResponse {
    status: string;
    data: Product[];
}