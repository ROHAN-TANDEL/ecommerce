import React from 'react';
import type { AuditLog } from '../types/auditTypes';

interface AuditDetailProps {
    log: AuditLog | null;
    onClose: () => void;
}

export const AuditDetail: React.FC<AuditDetailProps> = ({ log, onClose }) => {
    if (!log) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Audit Log Details
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

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Event ID</p>
                                <p className="font-mono text-sm">{log.event_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Correlation ID</p>
                                <p className="font-mono text-sm">{log.correlation_id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Action</p>
                                <p className="font-medium">{log.action}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Entity</p>
                                <p className="font-medium">{log.entity}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Entity ID</p>
                                <p className="font-medium">{log.entity_id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">User ID</p>
                                <p className="font-medium">{log.user_id || 'System'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">IP Address</p>
                                <p className="font-medium">{log.ip_address || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Timestamp</p>
                                <p className="font-medium">{new Date(log.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        {log.user_agent && (
                            <div>
                                <p className="text-sm text-gray-500">User Agent</p>
                                <p className="text-sm text-gray-600 break-all">{log.user_agent}</p>
                            </div>
                        )}

                        {log.metadata && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Metadata</p>
                                <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};