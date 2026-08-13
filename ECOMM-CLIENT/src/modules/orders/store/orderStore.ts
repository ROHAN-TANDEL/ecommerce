// src/modules/orders/store/orderStore.ts
import { create } from 'zustand';
import { orderService } from '../services/orderService';
import type { Order } from '../types/orderTypes';

interface OrderState {
    orders: Order[];
    selectedOrder: Order | null;
    isLoading: boolean;
    error: string | null;

    // Admin
    fetchAllOrders: () => Promise<void>;
    fetchOrder: (id: string) => Promise<void>;
    updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;

    // Customer
    fetchMyOrders: () => Promise<void>;
    fetchMyOrder: (id: string) => Promise<void>;

    clearError: () => void;
    clearSelected: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,

    fetchAllOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.listAll();
            set({ orders: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch orders',
                isLoading: false
            });
        }
    },

    fetchOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.getById(id);
            set({ selectedOrder: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch order',
                isLoading: false
            });
        }
    },

    updateOrderStatus: async (id: string, status: Order['status']) => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.updateStatus(id, { status });
            set((state) => ({
                orders: state.orders.map((order) =>
                    order.id === id ? response.data.data : order
                ),
                selectedOrder: response.data.data,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update order status',
                isLoading: false
            });
            throw error;
        }
    },

    fetchMyOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.getMyOrders();
            set({ orders: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch your orders',
                isLoading: false
            });
        }
    },

    fetchMyOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.getMyOrderById(id);
            set({ selectedOrder: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch order',
                isLoading: false
            });
        }
    },

    clearError: () => set({ error: null }),
    clearSelected: () => set({ selectedOrder: null })
}));