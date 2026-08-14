// src/modules/cart/components/CheckoutModal.tsx
import React, { useState } from 'react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    total: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                onConfirm,
                                                                isLoading,
                                                                total
                                                            }) => {
    const [agreeTerms, setAgreeTerms] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Confirm Order</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</p>
                        </div>

                        <div className="flex items-start space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the terms and conditions and confirm my order
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!agreeTerms || isLoading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};