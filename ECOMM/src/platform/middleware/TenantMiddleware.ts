// src/platform/middleware/TenantMiddleware.ts
import type { Response, NextFunction } from 'express';
import { TenantContext } from '../tenant/TenantContext.js';

/**
 * Minimal interface required by TenantMiddleware.
 * Avoids a circular dependency on the full PlatformContext.
 */
export interface TenantMiddlewareDeps {
    getDatabase(productId: string): any;
}

export class TenantMiddleware {
    private tenantContext: TenantContext;

    constructor(private deps: TenantMiddlewareDeps) {
        this.tenantContext = new TenantContext(deps);
    }

    /**
     * RULE: if a route is registered as a client route, a tenant ID is required.
     *
     * Reads x-tenant-id header → looks up tenant in master DB → sets:
     *   req.tenant      — the resolved TenantInfo
     *   req.tenantId    — shorthand id string
     *   req.db.client   — pool connection with search_path switched to tenant schema
     *   req.db.master   — plain master connection (if master role is enabled)
     *   req.db.get()    — explicit role accessor
     *   req.db.withTenant() — cross-tenant accessor
     */
    resolve = async (req: any, res: Response, next: NextFunction): Promise<void> => {
        try {
            const productId: string = req.productId;
            if (!productId) {
                res.status(500).json({ success: false, error: 'productId not set on request — RouteBinder misconfiguration' });
                return;
            }

            // RouteBinder sets requiresTenant = true for client routes, false for master routes.
            // master routes skip straight through.
            if (req.requiresTenant === false) {
                return next();
            }

            // --- Resolve tenant ---
            const result = await this.tenantContext.resolve(req, productId);
            req.tenant   = result.tenant;
            req.tenantId = result.tenant.id;

            // --- Build req.db with correct schema switching ---
            // db is the full DatabaseAccess proxy for this product.
            // For client queries we need search_path = tenant schema, so we use
            // the withTenant() path which injects the real schema into every query.
            const db = this.deps.getDatabase(productId);
            const tenantAccess = db.withTenant(result.tenant.id, result.tenant.schema);

            req.db = {
                // Client access: every query runs inside the tenant schema
                client: tenantAccess.client,

                // Master access: schema-less, only exposed if the product has a master role
                master: tenantAccess.master,

                // Keep these so controllers can do req.db.get('analytics') etc.
                get: (role: string) => db.get(role),

                // Manual cross-tenant access (advanced controllers only)
                withTenant: (id: string, schema?: string) => db.withTenant(id, schema),
            };

            console.log(`🔐 Tenant resolved: ${result.tenant.id} (schema: ${result.tenant.schema}) for ${productId}`);
            next();
        } catch (error: any) {
            console.error('Tenant resolution failed:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to resolve tenant',
                code: 'TENANT_RESOLUTION_FAILED',
            });
        }
    };

    /**
     * RULE: master routes pass through without a tenant check.
     * Client routes must have a resolved, active tenant before reaching controllers.
     */
    validate = async (req: any, res: Response, next: NextFunction): Promise<void> => {
        // master routes never go through resolve, so req.tenant is null — skip.
        if (req.requiresTenant === false) {
            return next();
        }

        if (!req.tenant) {
            res.status(400).json({
                success: false,
                error: 'Tenant context not found',
                code: 'TENANT_CONTEXT_MISSING',
            });
            return;
        }

        // isActive === false means explicitly disabled. undefined / true = allowed.
        if (req.tenant.isActive === false) {
            res.status(403).json({
                success: false,
                error: 'Tenant is inactive',
                code: 'TENANT_INACTIVE',
            });
            return;
        }

        next();
    };
}
