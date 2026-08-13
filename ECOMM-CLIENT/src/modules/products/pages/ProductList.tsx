// src/modules/products/pages/ProductList.tsx
import React from 'react';

export const ProductList: React.FC = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Products</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">Product A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">$99.99</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">50</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};