import { api } from '../../../core/api/client';
import type { AuditLog, IAuditFilters, AuditLogListResponse } from '../types/auditTypes';

export const auditService = {
    // Get audit logs with filters
    getLogs: (params: IAuditFilters = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });
        return api.get<AuditLogListResponse>(`/api/audit?${queryParams.toString()}`);
    },

    // Get single audit log
    getLogById: (id: string) =>
        api.get<{ status: string; data: AuditLog }>(`/api/audit/${id}`),

    // Get audit stats (if you have an endpoint)
    getStats: () =>
        api.get<{ status: string; data: any }>('/api/audit/stats'),
};