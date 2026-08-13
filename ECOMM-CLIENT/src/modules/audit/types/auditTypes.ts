export interface AuditLog {
    id: string;
    event_id: string;
    correlation_id: string;
    user_id: string | null;
    action: string;
    entity: string;
    entity_id: string | null;
    metadata: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

export interface AuditLogListResponse {
    status: string;
    data: AuditLog[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        page: number;
        totalPages: number;
    };
}

export interface IAuditFilters {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
}
