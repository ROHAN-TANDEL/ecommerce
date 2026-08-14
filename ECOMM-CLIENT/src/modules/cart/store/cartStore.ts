// src/modules/cart/store/cartStore.ts
import { create } from 'zustand';
import { cartService } from '../services/cartService';
import type { Cart, AddToCartData } from '../types/cartTypes';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    isCheckingOut: boolean;
    error: string | null;

    // Actions
    fetchCart: () => Promise<void>;
    addItem: (data: AddToCartData) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    checkout: () => Promise<{ success: boolean; orderId?: string }>;
    getTotalItems: () => number;
    getSubtotal: () => number;
    clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,
    isCheckingOut: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await cartService.getCart();
            set({ cart: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to load cart',
                isLoading: false
            });
        }
    },

    addItem: async (data: AddToCartData) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.addItem(data);
            await get().fetchCart();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to add item',
                isLoading: false
            });
            throw error;
        }
    },

    updateItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.updateItem(itemId, { quantity });
            await get().fetchCart();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update item',
                isLoading: false
            });
            throw error;
        }
    },

    removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.removeItem(itemId);
            await get().fetchCart();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to remove item',
                isLoading: false
            });
            throw error;
        }
    },

    clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
            await cartService.clearCart();
            set({ cart: null, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to clear cart',
                isLoading: false
            });
            throw error;
        }
    },

    checkout: async () => {
        set({ isCheckingOut: true, error: null });
        try {
            const response = await cartService.checkout();
            set({
                cart: null,
                isCheckingOut: false
            });
            return {
                success: true,
                orderId: response.data.orderId
            };
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Checkout failed',
                isCheckingOut: false
            });
            return { success: false };
        }
    },

    getTotalItems: () => {
        const { cart } = get();
        return cart?.totalItems || 0;
    },

    getSubtotal: () => {
        const { cart } = get();
        return cart ? parseFloat(cart.subtotal) : 0;
    },

    clearError: () => set({ error: null })
}));