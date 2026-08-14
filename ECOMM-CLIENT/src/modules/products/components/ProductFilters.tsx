// src/modules/products/components/ProductFilters.tsx
import React, { useState } from 'react';

interface ProductFiltersProps {
    onFilter: (filters: any) => void;
    onSearch: (query: string) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilter, onSearch }) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        onSearch(value);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatus(value);
        onFilter({ status: value });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            <select
                value={status}
                onChange={handleStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
            </select>
        </div>
    );
};