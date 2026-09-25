// src/platform/core/tenant-validator.ts

import { ConnectionManager } from './connection-manager';

export interface TenantContext {
    id: string;
}

export class TenantValidator {
    constructor(private readonly connectionManager: ConnectionManager) {}

    async validate(domain: string, tenantId: string): Promise<TenantContext> {
        // Query the master database to validate tenant
        const result = await this.connectionManager.queryMaster(
            domain,
            `SELECT id FROM tenants WHERE id = $1 AND status = 'active' LIMIT 1`,
            [tenantId]
        );

        if (result.rowCount === 0) {
            throw new Error(`Invalid or inactive tenant: ${tenantId}`);
        }

        return { id: String(result.rows[0].id) };
    }
}