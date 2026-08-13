// src/modules/products/store/productStore.ts
import { create } from 'zustand';
import { productService } from '../services/productService';
import type {Product, CreateProductData, UpdateProductData} from '../types/productTypes';

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    isLoading: boolean;
    error: string | null;

    fetchProducts: () => Promise<void>;
    fetchProduct: (id: string) => Promise<void>;
    createProduct: (data: CreateProductData) => Promise<void>;
    updateProduct: (id: string, data: UpdateProductData) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    clearError: () => void;
    clearSelected: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    selectedProduct: null,
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.list();
            set({ products: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch products',
                isLoading: false
            });
        }
    },

    fetchProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.getById(id);
            set({ selectedProduct: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch product',
                isLoading: false
            });
        }
    },

    createProduct: async (data: CreateProductData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.create(data);
            set((state) => ({
                products: [response.data.data, ...state.products],
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create product',
                isLoading: false
            });
            throw error;
        }
    },

    updateProduct: async (id: string, data: UpdateProductData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.update(id, data);
            set((state) => ({
                products: state.products.map((product) =>
                    product.id === id ? response.data.data : product
                ),
                selectedProduct: response.data.data,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update product',
                isLoading: false
            });
            throw error;
        }
    },

    deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await productService.delete(id);
            set((state) => ({
                products: state.products.filter((product) => product.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to delete product',
                isLoading: false
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    clearSelected: () => set({ selectedProduct: null })
}));