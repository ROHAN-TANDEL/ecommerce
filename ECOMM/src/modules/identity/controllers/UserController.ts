import type { Request, Response } from 'express';

export default class UserController {
    // Master access - no tenant needed
    listTenants = async (req: any, res: Response): Promise<void> => {
        try {
            // Uses master database (public schema)
            const result = await req.db.master.query(
                'SELECT id, name, schema, is_active FROM tenants'
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

    // Client access - tenant context automatically applied
    listUsers = async (req: any, res: Response): Promise<void> => {
        try {
            // Uses tenant schema automatically
            // Platform handles: SET search_path TO tenant_123
            const result = await req.db.client.query(
                'SELECT id, email, name, role FROM users'
            );

            // Tenant info is available
            const tenant = req.tenant;

            res.json({
                success: true,
                data: result.rows,
                tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    schema: tenant.schema
                }
            });
        } catch (error) {
            console.error('Error in listUsers:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    // Transaction with tenant context
    createUserWithAudit = async (req: any, res: Response): Promise<void> => {
        try {
            const { email, name, password, role } = req.body;

            const result = await req.db.client.withTransaction(async (client: any) => {
                // All queries run in tenant schema
                const userResult = await client.query(
                    `INSERT INTO users (email, name, password, role) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id, email, name, role`,
                    [email, name, password, role || 'user']
                );

                await client.query(
                    `INSERT INTO audit_logs (user_id, action, details) 
           VALUES ($1, $2, $3)`,
                    [userResult.rows[0].id, 'USER_CREATED', { email }]
                );

                return userResult.rows[0];
            });

            res.status(201).json({
                success: true,
                data: result,
                tenant: req.tenant.id
            });
        } catch (error) {
            console.error('Error in createUserWithAudit:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    // Manual tenant resolution
    getUsersForTenant = async (req: any, res: Response): Promise<void> => {
        try {
            const { tenantId } = req.params;

            // Manually switch to tenant
            const tenantDb = req.db.withTenant(tenantId);

            const result = await tenantDb.client.query(
                'SELECT id, email, name FROM users'
            );

            res.json({
                success: true,
                data: result.rows,
                tenant: tenantId
            });
        } catch (error) {
            console.error('Error in getUsersForTenant:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };
}