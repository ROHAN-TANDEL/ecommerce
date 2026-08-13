import React from 'react';
import type { AuditLog } from '../types/auditTypes';

interface AuditTableProps {
    logs: AuditLog[];
    onView: (log: AuditLog) => void;
    isLoading?: boolean;
}

export const AuditTable: React.FC<AuditTableProps> = ({
    logs,
    onView,
    isLoading
}) => {
    const actionColors: Record<string, string> = {
        CREATE: 'bg-green-100 text-green-800',
        UPDATE: 'bg-blue-100 text-blue-800',
        DELETE: 'bg-red-100 text-red-800',
        LOGIN: 'bg-purple-100 text-purple-800',
        LOGOUT: 'bg-gray-100 text-gray-800',
        REGISTER: 'bg-indigo-100 text-indigo-800',
        ERROR: 'bg-red-100 text-red-800',
        VIEW: 'bg-yellow-100 text-yellow-800',
    };

    const getActionColor = (action: string) => {
        const normalized = action.split('_').pop()?.toUpperCase() || action;
        return actionColors[normalized] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No audit logs found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                {log.event_id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {log.entity}
                                {log.entity_id && (
                                    <span className="text-gray-400 ml-1">#{log.entity_id}</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {log.user_id || 'System'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {log.ip_address || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onView(log)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};