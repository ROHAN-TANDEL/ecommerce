import React, { useEffect, useState } from 'react';
import { useAuditStore } from '../store/auditStore';
import { AuditTable } from '../components/AuditTable';
import { AuditFilters } from '../components/AuditFilters';
import { AuditDetail } from '../components/AuditDetail';
import type { AuditLog } from '../types/auditTypes';

export const AuditLogs: React.FC = () => {
    const {
        logs,
        isLoading,
        error,
        pagination,
        filters,
        fetchLogs,
        setFilters,
        clearFilters,
        clearError
    } = useAuditStore();

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleViewLog = (log: AuditLog) => {
        setSelectedLog(log);
        setShowDetail(true);
    };

    const handlePageChange = (newPage: number) => {
        const offset = (newPage - 1) * (filters.limit || 50);
        setFilters({ ...filters, offset });
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-700 hover:text-red-900">×</button>
            </div>
        );
    }

    const totalPages = pagination?.totalPages || 0;
    const currentPage = pagination?.page || 1;

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Track all system activities and user actions
                        </p>
                    </div>
                    {pagination && (
                        <div className="text-sm text-gray-500">
                            Total: {pagination.total} entries
                        </div>
                    )}
                </div>
            </div>

            <AuditFilters
                filters={filters}
                onFilter={setFilters}
                onClear={clearFilters}
                isLoading={isLoading}
            />

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <AuditTable
                    logs={logs}
                    onView={handleViewLog}
                    isLoading={isLoading}
                />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * (filters.limit || 50)) + 1} to{' '}
                        {Math.min(currentPage * (filters.limit || 50), pagination?.total || 0)} of{' '}
                        {pagination?.total || 0} entries
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                            {currentPage}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {showDetail && (
                <AuditDetail
                    log={selectedLog}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedLog(null);
                    }}
                />
            )}
        </div>
    );
};