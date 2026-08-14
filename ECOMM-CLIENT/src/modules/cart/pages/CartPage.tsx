// src/modules/cart/pages/Cart.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import { CheckoutModal } from '../components/CheckoutModal';

export const CartPage: React.FC = () => {
    const {
        cart,
        isLoading,
        isCheckingOut,
        error,
        fetchCart,
        updateItem,
        removeItem,
        clearCart,
        checkout,
        getTotalItems,
        getSubtotal,
        clearError
    } = useCartStore();

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const handleCheckout = async () => {
        const result = await checkout();
        if (result.success) {
            setOrderId(result.orderId || null);
            setCheckoutSuccess(true);
            setShowCheckoutModal(false);
        }
    };

    const totalItems = getTotalItems();
    const subtotal = getSubtotal();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-700 hover:text-red-900">×</button>
            </div>
        );
    }

    if (checkoutSuccess) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                    <p className="text-gray-600 mb-4">
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>
                    {orderId && (
                        <p className="text-sm text-gray-500">
                            Order ID: <span className="font-mono font-medium">{orderId}</span>
                        </p>
                    )}
                    <Link
                        to="/dashboard"
                        className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (totalItems === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
                <Link
                    to="/products"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="hidden md:grid grid-cols-4 gap-4 mb-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="col-span-2">Product</span>
                            <span>Quantity</span>
                            <span className="text-right">Subtotal</span>
                        </div>
                        <div>
                            {cart?.items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdate={updateItem}
                                    onRemove={removeItem}
                                    isUpdating={isLoading}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="lg:col-span-1">
                    <CartSummary
                        subtotal={subtotal}
                        totalItems={totalItems}
                        onCheckout={() => setShowCheckoutModal(true)}
                        isCheckingOut={isCheckingOut}
                    />
                </div>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={showCheckoutModal}
                onClose={() => setShowCheckoutModal(false)}
                onConfirm={handleCheckout}
                isLoading={isCheckingOut}
                total={subtotal * 1.08 + (subtotal > 100 ? 0 : 10)}
            />
        </div>
    );
};