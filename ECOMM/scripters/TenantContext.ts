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
     * Resolve tenant from header or default
     */
    async resolve(
        req: any,
        productId: string,
        tenantId?: string
    ): Promise<TenantResolutionResult> {
        // 1. Get tenant ID from header or parameter
        const resolvedTenantId = tenantId || req.headers['x-tenant-id'];

        if (!resolvedTenantId) {
            // Try to get default tenant
            const defaultTenant = await this.getDefaultTenant(productId);
            if (defaultTenant) {
                return {
                    tenant: defaultTenant,
                    productId
                };
            }

            throw new Error('Tenant ID required and no default tenant configured');
        }

        // 2. Check cache
        const cacheKey = `${productId}:${resolvedTenantId}`;
        let tenant = this.tenantCache.get(cacheKey);

        if (tenant) {
            return { tenant, productId };
        }

        // 3. Resolve from master database
        tenant = await this.resolveFromMaster(productId, resolvedTenantId);

        if (!tenant) {
            throw new Error(`Tenant "${resolvedTenantId}" not found in product "${productId}"`);
        }

        // 4. Cache tenant
        this.tenantCache.set(cacheKey, tenant);

        return { tenant, productId };
    }

    /**
     * Resolve tenant from master database
     */
    private async resolveFromMaster(
        productId: string,
        tenantId: string
    ): Promise<TenantInfo | null> {
        try {
            // Get master database access
            const db = this.platform.getDatabase(productId);

            // Query tenant from master schema
            const result = await db.master.query(
                `SELECT 
          id, 
          schema, 
          name, 
          config, 
          is_active 
        FROM tenants 
        WHERE id = $1 AND is_active = true`,
                [tenantId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];

            return {
                id: row.id,
                schema: row.schema || `tenant_${row.id}`,
                name: row.name || row.id,
                config: row.config || {},
                isActive: row.is_active
            };
        } catch (error) {
            console.error(`Failed to resolve tenant "${tenantId}" from master:`, error);
            return null;
        }
    }

    /**
     * Get default tenant for a product
     */
    private async getDefaultTenant(productId: string): Promise<TenantInfo | null> {
        try {
            const db = this.platform.getDatabase(productId);

            const result = await db.master.query(
                `SELECT 
          id, 
          schema, 
          name, 
          config, 
          is_active 
        FROM tenants 
        WHERE is_default = true AND is_active = true 
        LIMIT 1`
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];

            return {
                id: row.id,
                schema: row.schema || `tenant_${row.id}`,
                name: row.name || row.id,
                config: row.config || {},
                isActive: row.is_active
            };
        } catch (error) {
            console.error(`Failed to get default tenant for "${productId}":`, error);
            return null;
        }
    }

    /**
     * Invalidate tenant cache
     */
    invalidateCache(productId: string, tenantId: string): void {
        const cacheKey = `${productId}:${tenantId}`;
        this.tenantCache.delete(cacheKey);
        console.log(`🗑️ Tenant cache invalidated: ${cacheKey}`);
    }

    /**
     * Clear all tenant cache
     */
    clearCache(): void {
        this.tenantCache.clear();
        console.log('🗑️ All tenant cache cleared');
    }

    /**
     * Get tenant cache stats
     */
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.tenantCache.size,
            keys: Array.from(this.tenantCache.keys())
        };
    }
}


