// src/modules/products/components/ProductTable.tsx
import React from 'react';
import type { Product } from '../types/productTypes';

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onAddToCart: (id: string) => void;
    isLoading?: boolean;
    isAddingToCart?: boolean;
    addingToCartId?: string | null;
}

export const ProductTable: React.FC<ProductTableProps> = ({
                                                              products,
                                                              onEdit,
                                                              onDelete,
                                                              onAddToCart,
                                                              isLoading,
                                                              isAddingToCart,
                                                              addingToCartId
                                                          }) => {
    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-gray-100 text-gray-800',
        DRAFT: 'bg-yellow-100 text-yellow-800',
        ARCHIVED: 'bg-red-100 text-red-800'
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No products found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {product.description}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${parseFloat(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {product.stock_quantity}
                                </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {product.status}
                                </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => onAddToCart(product.id)}
                                disabled={isAddingToCart || product.stock_quantity <= 0}
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors mr-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAddingToCart && addingToCartId === product.id ? (
                                    <span className="flex items-center space-x-1">
                                            <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Adding</span>
                                        </span>
                                ) : product.stock_quantity <= 0 ? (
                                    'Out of Stock'
                                ) : (
                                    'Add to Cart'
                                )}
                            </button>
                            <button
                                onClick={() => onEdit(product)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(product.id)}
                                className="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};