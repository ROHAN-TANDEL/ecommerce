import React, { useState, useEffect } from 'react';
import type { IAuditFilters as AuditFiltersType } from '../types/auditTypes';

interface AuditFiltersProps {
    filters: AuditFiltersType;
    onFilter: (filters: AuditFiltersType) => void;
    onClear: () => void;
    isLoading?: boolean;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
    filters,
    onFilter,
    onClear,
    isLoading
}) => {
    const [localFilters, setLocalFilters] = useState<AuditFiltersType>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key: keyof AuditFiltersType, value: string) => {
        setLocalFilters({ ...localFilters, [key]: value || undefined });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(localFilters);
    };

    const handleClear = () => {
        setLocalFilters({ limit: 50, offset: 0 });
        onClear();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                    </label>
                    <input
                        type="text"
                        value={localFilters.userId || ''}
                        onChange={(e) => handleChange('userId', e.target.value)}
                        placeholder="Filter by user ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action
                    </label>
                    <input
                        type="text"
                        value={localFilters.action || ''}
                        onChange={(e) => handleChange('action', e.target.value)}
                        placeholder="e.g., CREATE, UPDATE, DELETE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity
                    </label>
                    <input
                        type="text"
                        value={localFilters.entity || ''}
                        onChange={(e) => handleChange('entity', e.target.value)}
                        placeholder="e.g., users, products, orders"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity ID
                    </label>
                    <input
                        type="text"
                        value={localFilters.entityId || ''}
                        onChange={(e) => handleChange('entityId', e.target.value)}
                        placeholder="Entity ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                    </label>
                    <input
                        type="datetime-local"
                        value={localFilters.fromDate || ''}
                        onChange={(e) => handleChange('fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                    </label>
                    <input
                        type="datetime-local"
                        value={localFilters.toDate || ''}
                        onChange={(e) => handleChange('toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Limit
                    </label>
                    <select
                        value={localFilters.limit || 50}
                        onChange={(e) => handleChange('limit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>

                <div className="flex items-end space-x-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : 'Apply Filters'}
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </form>
    );
};