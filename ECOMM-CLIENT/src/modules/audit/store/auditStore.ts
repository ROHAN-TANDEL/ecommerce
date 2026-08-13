import { create } from 'zustand';
import { auditService } from '../services/auditService';
import type { AuditLog, IAuditFilters } from '../types/auditTypes';

interface AuditState {
    logs: AuditLog[];
    selectedLog: AuditLog | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
        total: number;
        limit: number;
        offset: number;
        page: number;
        totalPages: number;
    } | null;
    filters: IAuditFilters;

    // Actions
    fetchLogs: (filters?: IAuditFilters) => Promise<void>;
    fetchLogById: (id: string) => Promise<void>;
    setFilters: (filters: IAuditFilters) => void;
    clearFilters: () => void;
    clearError: () => void;
    clearSelected: () => void;
}

const defaultFilters: IAuditFilters = {
    limit: 50,
    offset: 0,
};

export const useAuditStore = create<AuditState>((set, get) => ({
    logs: [],
    selectedLog: null,
    isLoading: false,
    error: null,
    pagination: null,
    filters: defaultFilters,

    fetchLogs: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const mergedFilters = { ...get().filters, ...filters };
            const response = await auditService.getLogs(mergedFilters);
            set({
                logs: response.data.data,
                pagination: response.data.pagination,
                filters: mergedFilters,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch audit logs',
                isLoading: false
            });
        }
    },

    fetchLogById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await auditService.getLogById(id);
            set({
                selectedLog: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch audit log',
                isLoading: false
            });
        }
    },

    setFilters: (filters: IAuditFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters, offset: 0 }
        }));
        get().fetchLogs();
    },

    clearFilters: () => {
        set({ filters: defaultFilters });
        get().fetchLogs();
    },

    clearError: () => set({ error: null }),
    clearSelected: () => set({ selectedLog: null })
}));