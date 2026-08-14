// src/modules/products/components/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import type { Product } from '../types/productTypes';

interface ProductFormProps {
    product?: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
    const { createProduct, updateProduct, isLoading } = useProductStore();
    const [formData, setFormData] = useState({
        sku: '',
        category_id: '',
        name: '',
        description: '',
        price: '',
        stock_quantity: 0,
        status: 'ACTIVE'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku,
                category_id: product.category_id,
                name: product.name,
                description: product.description || '',
                price: product.price,
                stock_quantity: product.stock_quantity,
                status: product.status
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.sku) newErrors.sku = 'SKU is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
        if (formData.stock_quantity < 0) newErrors.stock_quantity = 'Stock cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (product) {
                await updateProduct(product.id, formData);
            } else {
                await createProduct(formData);
            }
            onSuccess();
        } catch (error) {
            // Error handled by store
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {product ? 'Edit Product' : 'Add New Product'}
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                        errors.sku ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.sku && (
                                    <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Category ID"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    value={formData.stock_quantity}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                        errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.stock_quantity && (
                                    <p className="text-red-500 text-xs mt-1">{errors.stock_quantity}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="DRAFT">Draft</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};