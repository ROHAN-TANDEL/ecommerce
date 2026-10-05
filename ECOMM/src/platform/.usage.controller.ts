// src/modules/identity/controllers/UserController.ts
import { Request, Response } from 'express';
import { PoolClient } from 'pg';

export class UserController {
  // Simple query - auto manages connection
  list = async (req: any, res: Response): Promise<void> => {
    try {
      // Query automatically gets a connection and releases it
      const result = await req.db.master.query(
        'SELECT * FROM users LIMIT 10'
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error in list:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // Transaction with auto connection management
  createWithTransaction = async (req: any, res: Response): Promise<void> => {
    try {
      const { email, name, password, role } = req.body;

      // Transaction automatically handles connection, begin, commit, rollback, release
      const result = await req.db.master.withTransaction(async (client: PoolClient) => {
        // Check if user exists
        const checkResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [email]
        );

        if (checkResult.rows.length > 0) {
          throw new Error('User with this email already exists');
        }

        // Create user
        const insertResult = await client.query(
          `INSERT INTO users (email, name, password, role)
           VALUES ($1, $2, $3, $4)
           RETURNING id, email, name, role, created_at`,
          [email, name, password, role || 'user']
        );

        // Create audit log in same transaction
        await client.query(
          `INSERT INTO audit_logs (user_id, action, details)
           VALUES ($1, $2, $3)`,
          [insertResult.rows[0].id, 'USER_CREATED', { email }]
        );

        return insertResult.rows[0];
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error in createWithTransaction:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  // Manual connection management (for complex operations)
  complexOperation = async (req: any, res: Response): Promise<void> => {
    const client = await req.db.master.getConnection();

    try {
      // Do multiple operations
      await client.query('BEGIN');

      // Operation 1
      await client.query('UPDATE users SET status = $1 WHERE id = $2', ['active', req.params.id]);

      // Operation 2
      await client.query('INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)', [req.params.id, 'STATUS_UPDATED']);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Operation completed successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in complexOperation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    } finally {
      // Always release the connection
      client.release();
    }
  };

  // Multiple queries in transaction
  batchCreate = async (req: any, res: Response): Promise<void> => {
    try {
      const { users } = req.body;

      const queries = users.map((user: any) => ({
        text: `INSERT INTO users (email, name, password, role)
               VALUES ($1, $2, $3, $4) RETURNING id, email, name`,
        params: [user.email, user.name, user.password, user.role || 'user']
      }));

      // Execute all queries in a single transaction
      const results = await req.db.master.transaction(queries);

      res.status(201).json({
        success: true,
        data: results.map(r => r.rows[0]),
        message: `${users.length} users created successfully`
      });
    } catch (error) {
      console.error('Error in batchCreate:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  // Get pool status (for admin)
  getPoolStatus = async (req: any, res: Response): Promise<void> => {
    try {
      // This would use platform's pool status
      const stats = req.platform?.database?.getPoolStats() || [];

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getPoolStatus:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}