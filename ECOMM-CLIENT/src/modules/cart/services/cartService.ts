// src/modules/cart/services/cartService.ts
import { api } from '../../../core/api/client';
import type {Cart, AddToCartData, UpdateCartItemData, ICartItem} from '../types/cartTypes';

export const cartService = {
    // Get cart
    getCart: () =>
        api.get<{ status: string; data: Cart }>('/cart'),

    // Add item to cart
    addItem: (data: AddToCartData) =>
        api.post<{ status: string; message: string; data?: ICartItem }>('/cart/items', data),

    // Update item quantity
    updateItem: (itemId: string, data: UpdateCartItemData) =>
        api.patch<{ status: string; message: string }>(`/cart/items/${itemId}`, data),

    // Remove item from cart
    removeItem: (itemId: string) =>
        api.delete<{ status: string; message: string }>(`/cart/items/${itemId}`),

    // Clear cart
    clearCart: () =>
        api.delete<{ status: string; message: string }>('/cart'),

    // Checkout
    checkout: () =>
        api.post<{ status: string; message: string; orderId?: string }>('/checkout')
};