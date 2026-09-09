// src/modules/admin/controllers/TenantController.ts
import type { Request, Response } from 'express';
import type { PlatformContext } from '../../../platform/context.js';

export class TenantController {
    constructor(private platform: PlatformContext) {}

    /**
     * Create a new tenant
     */
    createTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, id, name, schema, config } = req.body;

            const db = this.platform.getDatabase(productId);

            // Create tenant in master schema
            const result = await db.master.query(
                `INSERT INTO tenants (id, name, schema, config, is_active, is_default, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
         RETURNING *`,
                [id, name, schema || `tenant_${id}`, config || {}, true, false]
            );

            // Create tenant schema in client database
            const tenantSchema = schema || `tenant_${id}`;

            await db.master.query(
                `CREATE SCHEMA IF NOT EXISTS ${tenantSchema}`
            );

            // Create default tables in tenant schema
            await db.master.query(`
        CREATE TABLE IF NOT EXISTS ${tenantSchema}.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            await db.master.query(`
        CREATE TABLE IF NOT EXISTS ${tenantSchema}.audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES ${tenantSchema}.users(id),
          action TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: `Tenant "${id}" created with schema "${tenantSchema}"`
            });
        } catch (error) {
            console.error('Error in createTenant:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * List all tenants
     */
    listTenants = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId } = req.params;

            const db = this.platform.getDatabase(productId);

            const result = await db.master.query(
                'SELECT id, name, schema, is_active, is_default, created_at FROM tenants'
            );

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error in listTenants:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get tenant details
     */
    getTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, tenantId } = req.params;

            const db = this.platform.getDatabase(productId);

            const result = await db.master.query(
                'SELECT id, name, schema, config, is_active, is_default, created_at FROM tenants WHERE id = $1',
                [tenantId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: 'Tenant not found'
                });
                return;
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in getTenant:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Update tenant
     */
    updateTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, tenantId } = req.params;
            const { name, config, isActive, isDefault } = req.body;

            const db = this.platform.getDatabase(productId);

            const result = await db.master.query(
                `UPDATE tenants 
         SET name = COALESCE($1, name),
             config = COALESCE($2, config),
             is_active = COALESCE($3, is_active),
             is_default = COALESCE($4, is_default)
         WHERE id = $5
         RETURNING *`,
                [name, config, isActive, isDefault, tenantId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: 'Tenant not found'
                });
                return;
            }

            // Invalidate cache
            this.platform.tenantContext?.invalidateCache(productId, tenantId);

            res.json({
                success: true,
                data: result.rows[0],
                message: 'Tenant updated successfully'
            });
        } catch (error) {
            console.error('Error in updateTenant:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };
}