// src/modules/cart/components/CartItem.tsx
import React, { useState } from 'react';
import type {ICartItem as CartItemType} from '../types/cartTypes';

interface CartItemProps {
    item: CartItemType;
    onUpdate: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
    isUpdating?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
                                                      item,
                                                      onUpdate,
                                                      onRemove,
                                                      isUpdating
                                                  }) => {
    const [quantity, setQuantity] = useState(item.quantity);
    const [isChanging, setIsChanging] = useState(false);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value >= 1) {
            setQuantity(value);
        }
    };

    const handleUpdate = () => {
        if (quantity !== item.quantity) {
            setIsChanging(true);
            onUpdate(item.id, quantity);
            setTimeout(() => setIsChanging(false), 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUpdate();
        }
    };

    const handleBlur = () => {
        handleUpdate();
    };

    return (
        <div className="flex items-center py-4 border-b border-gray-100 last:border-0">
            {/* Product Image Placeholder */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>

            {/* Product Info */}
            <div className="flex-1 ml-4">
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                    ${parseFloat(item.unit_price).toFixed(2)}
                </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
                <input
                    type="number"
                    min="1"
                    max={item.stock_quantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    disabled={isUpdating || isChanging}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {(isUpdating || isChanging) && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                )}
            </div>

            {/* Subtotal */}
            <div className="w-24 text-right ml-4">
                <p className="text-sm font-medium text-gray-900">
                    ${parseFloat(item.subtotal).toFixed(2)}
                </p>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(item.id)}
                disabled={isUpdating}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};