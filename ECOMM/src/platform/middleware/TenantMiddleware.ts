// src/platform/middleware/TenantMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { PlatformContext } from '../context.js';
import { TenantContext } from '../tenant/TenantContext.js';

export class TenantMiddleware {
    private tenantContext: TenantContext;

    constructor(private platform: PlatformContext) {
        this.tenantContext = new TenantContext(platform);
    }

    /**
     * Middleware to resolve and attach tenant to request
     */
    resolve = async (req: any, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Get product ID from request (set by route binder)
            const productId = req.productId;

            if (!productId) {
                return res.status(500).json({
                    success: false,
                    error: 'Product ID not found in request'
                });
            }

            // Check if route requires tenant
            const requiresTenant = req.requiresTenant !== false;

            if (!requiresTenant) {
                // No tenant needed, continue
                return next();
            }

            // Resolve tenant
            const result = await this.tenantContext.resolve(req, productId);

            // Attach tenant to request
            req.tenant = result.tenant;
            req.tenantId = result.tenant.id;

            // Create tenant-aware database access
            req.db = this.platform.getDatabase(productId).withTenant(result.tenant.id);

            console.log(`🔐 Tenant resolved: ${result.tenant.id} (schema: ${result.tenant.schema}) for ${productId}`);

            next();
        } catch (error) {
            console.error('Tenant resolution failed:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to resolve tenant',
                code: 'TENANT_RESOLUTION_FAILED'
            });
        }
    };

    /**
     * Middleware to validate tenant exists
     */
    validate = async (req: any, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.tenant) {
                return res.status(400).json({
                    success: false,
                    error: 'Tenant context not found',
                    code: 'TENANT_CONTEXT_MISSING'
                });
            }

            if (!req.tenant.isActive) {
                return res.status(403).json({
                    success: false,
                    error: 'Tenant is inactive',
                    code: 'TENANT_INACTIVE'
                });
            }

            next();
        } catch (error) {
            console.error('Tenant validation failed:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to validate tenant',
                code: 'TENANT_VALIDATION_FAILED'
            });
        }
    };
}