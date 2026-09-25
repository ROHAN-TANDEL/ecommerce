import { DatabaseInterface } from '../registry/types';

export interface TenantContext {
    id: string;
}

export interface TenantValidatorStrategy {
    validate(domain: string, tenantId: string): Promise<TenantContext>;
}

export class TenantValidator implements TenantValidatorStrategy {
    constructor(private readonly database: DatabaseInterface) {}

    async validate(domain: string, tenantId: string): Promise<TenantContext> {
        const pool = this.database.master(domain);
        const client = await pool.connect();

        try {
            // Domain-specific tenant validation
            // Each domain can override this by extending the class
            const result = await client.query(
                `SELECT id FROM tenants WHERE id = $1 AND status = 'active' LIMIT 1`,
                [tenantId]
            );

            if (result.rowCount === 0) {
                throw new Error(`Invalid or inactive tenant: ${tenantId}`);
            }

            return { id: String(result.rows[0].id) };
        } finally {
            client.release();
        }
    }
}