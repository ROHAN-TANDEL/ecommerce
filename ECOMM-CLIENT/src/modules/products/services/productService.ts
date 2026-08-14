// src/modules/products/services/productService.ts
import { api } from '../../../core/api/client';
import type { Product, CreateProductData, UpdateProductData } from '../types/productTypes';

export const productService = {
    list: () =>
        api.get<{ status: string; data: Product[] }>('/products'),

    getById: (id: string) =>
        api.get<{ status: string; data: Product }>(`/products/${id}`),

    create: (data: CreateProductData) =>
        api.post<{ status: string; data: Product }>('/products', data),

    update: (id: string, data: UpdateProductData) =>
        api.post<{ status: string; data: Product }>(`/products/${id}`, data),

    delete: (id: string) =>
        api.delete<{ status: string; data: { id: string; deleted_at: string } }>(`/products/${id}`)
};