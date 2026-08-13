// src/modules/products/pages/ProductList.tsx
import React, { useState, useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import { ProductTable } from '../components/ProductTable';
import { ProductForm } from '../components/ProductForm';
import { ProductFilters } from '../components/ProductFilters';
import type { Product } from '../types/productTypes';
import { useCartStore } from '../../cart/store/cartStore';
//import {useToast} from "../../../ui/hooks/useToast.ts";

export const ProductList: React.FC = () => {
    const { products, isLoading, error, fetchProducts, deleteProduct } = useProductStore();
    const { addItem, isLoading: isCartLoading } = useCartStore();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [filters, setFilters] = useState({ status: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.sku.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query)
            );
        }

        if (filters.status) {
            result = result.filter((p) => p.status === filters.status);
        }

        setFilteredProducts(result);
    }, [products, searchQuery, filters]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    // const { addItem } = useCartStore();
    // const { showToast } = useToast();

    const handleAddToCart = async (productId: string) => {
        setAddingToCartId(productId);
        try {
            await addItem({ productId, quantity: 1 });
            setNotification({
                message: 'Product added to cart successfully!',
                type: 'success'
            });
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            setNotification({
                message: error.response?.data?.message || 'Failed to add to cart',
                type: 'error'
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setAddingToCartId(null);
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
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
                    notification.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {notification.message}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredProducts.length} products found
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Product</span>
                </button>
            </div>

            <ProductFilters
                onFilter={(newFilters) => setFilters(newFilters)}
                onSearch={(query) => setSearchQuery(query)}
            />

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ProductTable
                    products={filteredProducts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddToCart={handleAddToCart}
                    isLoading={isLoading}
                    isAddingToCart={isCartLoading}
                    addingToCartId={addingToCartId}
                />
            </div>

            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onClose={handleCloseForm}
                    onSuccess={() => {
                        handleCloseForm();
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
};