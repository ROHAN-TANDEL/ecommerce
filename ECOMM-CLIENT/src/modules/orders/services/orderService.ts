// src/modules/orders/services/orderService.ts
import { api } from '../../../core/api/client';
import type { Order, UpdateOrderStatus } from '../types/orderTypes';

export const orderService = {
    // Admin: Get all orders
    listAll: () =>
        api.get<{ status: string; data: Order[] }>('/orders'),

    // Admin: Get order by id
    getById: (id: string) =>
        api.get<{ status: string; data: Order }>(`/orders/${id}`),

    // Admin: Update order status
    updateStatus: (id: string, data: UpdateOrderStatus) =>
        api.patch<{ status: string; data: Order }>(`/orders/${id}/status`, data),

    // Customer: Get my orders
    getMyOrders: () =>
        api.get<{ status: string; data: Order[] }>('/orders/my'),

    // Customer: Get my order by id
    getMyOrderById: (id: string) =>
        api.get<{ status: string; data: Order }>(`/orders/my/${id}`),
};