// src/platform/tenant/TenantContext.ts

export interface TenantInfo {
    id: string;
    schema: string;
    name?: string;
    config?: Record<string, any>;
    isActive?: boolean;
}

export interface TenantResolutionResult {
    tenant: TenantInfo;
    productId: string;
}

export class TenantContext {
    private tenantCache: Map<string, TenantInfo> = new Map();

    constructor(private platform: any) {}

    /**
     * Resolve tenant for a request.
     *
     * Priority:
     *  1. explicit tenantId argument
     *  2. x-tenant-id request header
     *  3. default tenant from master DB (if configured)
     *
     * Throws if no tenant can be resolved.
     */
    async resolve(
        req: any,
        productId: string,
        tenantId?: string
    ): Promise<TenantResolutionResult> {
        const resolvedTenantId: string | undefined = tenantId || req.headers['x-tenant-id'];

        if (!resolvedTenantId) {
            // No tenant header — try for a default tenant
            const defaultTenant = await this.getDefaultTenant(productId);
            if (defaultTenant) {
                return { tenant: defaultTenant, productId };
            }
            throw new Error(
                'x-tenant-id header is required for this route. No default tenant is configured.'
            );
        }

        // Cache check
        const cacheKey = `${productId}:${resolvedTenantId}`;
        const cached = this.tenantCache.get(cacheKey);
        if (cached) {
            return { tenant: cached, productId };
        }

        // Resolve from master DB
        const tenant = await this.resolveFromMaster(productId, resolvedTenantId);

        if (!tenant) {
            throw new Error(
                `Tenant "${resolvedTenantId}" not found or inactive for product "${productId}"`
            );
        }

        this.tenantCache.set(cacheKey, tenant);
        return { tenant, productId };
    }

    /**
     * Query the master DB to find the tenant row.
     * Throws on DB error (does NOT silently return null) so callers see the real cause.
     */
    private async resolveFromMaster(
        productId: string,
        tenantId: string
    ): Promise<TenantInfo | null> {
        const db = this.platform.getDatabase(productId);

        // Will throw if master pool is down — caller surfaces this as 400/500
        const result = await db.master.query(
            `SELECT id, schema, name, config, is_active
             FROM tenants
             WHERE id = $1 AND is_active = true`,
            [tenantId]
        );

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            id: row.id,
            schema: row.schema || `tenant_${row.id}`,
            name: row.name || row.id,
            config: row.config || {},
            isActive: row.is_active,
        };
    }

    /**
     * Query the master DB for the default tenant.
     * Returns null (not throws) — absence of a default is a normal configuration state.
     */
    private async getDefaultTenant(productId: string): Promise<TenantInfo | null> {
        try {
            const db = this.platform.getDatabase(productId);

            const result = await db.master.query(
                `SELECT id, schema, name, config, is_active
                 FROM tenants
                 WHERE is_default = true AND is_active = true
                 LIMIT 1`
            );

            if (result.rows.length === 0) return null;

            const row = result.rows[0];
            return {
                id: row.id,
                schema: row.schema || `tenant_${row.id}`,
                name: row.name || row.id,
                config: row.config || {},
                isActive: row.is_active,
            };
        } catch (error) {
            // Default tenant lookup is best-effort; a DB error here should not
            // block the "missing header" error from propagating clearly.
            console.warn(`[TenantContext] Could not fetch default tenant for "${productId}":`, error);
            return null;
        }
    }

    invalidateCache(productId: string, tenantId: string): void {
        this.tenantCache.delete(`${productId}:${tenantId}`);
    }

    clearCache(): void {
        this.tenantCache.clear();
    }

    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.tenantCache.size,
            keys: Array.from(this.tenantCache.keys()),
        };
    }
}
