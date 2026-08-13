// src/modules/orders/components/OrderDetail.tsx
import React from 'react';
import type { Order } from '../types/orderTypes';

interface OrderDetailProps {
    order: Order | null;
    onClose: () => void;
    isLoading?: boolean;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ order, isLoading, onClose }) => {
    if (!order) return null;

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        PROCESSING: 'bg-purple-100 text-purple-800',
        SHIPPED: 'bg-indigo-100 text-indigo-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Order #{order.order_number}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="font-medium">
                                {order.user?.first_name} {order.user?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{order.user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                        <div className="space-y-2">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <div>
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">${parseFloat(item.line_total).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total</span>
                            <span className="text-xl font-bold text-blue-600">
                                ${parseFloat(order.subtotal).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};