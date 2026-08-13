// src/modules/cart/pages/Cart.tsx
import React from 'react';

export const Cart: React.FC = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            </div>
        </div>
    );
};