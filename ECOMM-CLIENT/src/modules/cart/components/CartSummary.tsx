// src/modules/cart/components/CartSummary.tsx
import React from 'react';

interface CartSummaryProps {
    subtotal: number;
    totalItems: number;
    onCheckout: () => void;
    isCheckingOut: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
                                                            subtotal,
                                                            totalItems,
                                                            onCheckout,
                                                            isCheckingOut
                                                        }) => {
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-base font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onCheckout}
                disabled={totalItems === 0 || isCheckingOut}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
                {isCheckingOut ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    'Proceed to Checkout'
                )}
            </button>

            {totalItems === 0 && (
                <p className="text-sm text-gray-500 text-center mt-3">
                    Your cart is empty
                </p>
            )}
        </div>
    );
};