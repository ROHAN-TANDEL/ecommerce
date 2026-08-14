// src/modules/orders/pages/OrderList.tsx
import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { OrderTable } from '../components/OrderTable';
import { OrderDetail } from '../components/OrderDetail';
import type { Order } from '../types/orderTypes';
import { useToast } from '../../../context/ToastContext';

export const OrderList: React.FC = () => {
    const { orders, isLoading, error, fetchAllOrders, fetchOrder, updateOrderStatus } = useOrderStore();
    const { showToast } = useToast();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const handleViewOrder = async (order: Order) => {
        setIsLoadingDetail(true);
        setShowDetail(true);
        
        try {
            // Fetch full order details with items
            await fetchOrder(order.id);
            const fullOrder = useOrderStore.getState().selectedOrder;
            
            if (fullOrder) {
                setSelectedOrder(fullOrder);
            } else {
                // Fallback: use the order from list if full fetch fails
                setSelectedOrder(order);
                showToast('Order details loaded partially', 'warning');
            }
        } catch (error:any) {
            console.error('Failed to fetch order details:', error);
            showToast('Failed to load order details', 'error');
            // Fallback: show what we have from the list
            setSelectedOrder(order);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleStatusChange = async (id: string, status: Order['status']) => {
        try {
            await updateOrderStatus(id, status);
            showToast(`Order status updated to ${status}`, 'success');
        } catch (error) {
            showToast('Failed to update order status', 'error');
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage all customer orders
                </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <OrderTable
                    orders={orders}
                    onView={handleViewOrder}
                    onStatusChange={handleStatusChange}
                    isLoading={isLoading}
                />
            </div>

            {showDetail && (
                <OrderDetail
                    order={selectedOrder}
                    isLoading={isLoadingDetail}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};