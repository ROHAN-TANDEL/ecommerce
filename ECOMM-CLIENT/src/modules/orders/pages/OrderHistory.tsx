// src/modules/orders/pages/OrderHistory.tsx
import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { OrderDetail } from '../components/OrderDetail';
import type { Order } from '../types/orderTypes';

export const OrderHistory: React.FC = () => {
    const { orders, isLoading, error, fetchMyOrders } = useOrderStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        PROCESSING: 'bg-purple-100 text-purple-800',
        SHIPPED: 'bg-indigo-100 text-indigo-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500">Start shopping to see your orders here.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-500 mt-1">
                    View your order history
                </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                        <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex flex-wrap items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Order #{order.order_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.total_items} items
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">
                                        ${parseFloat(order.subtotal).toFixed(2)}
                                    </p>
                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setShowDetail(true);
                                }}
                                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View Details →
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {showDetail && (
                <OrderDetail
                    order={selectedOrder}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};