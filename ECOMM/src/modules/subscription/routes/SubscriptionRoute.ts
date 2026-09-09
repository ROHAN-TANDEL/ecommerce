import express from 'express';

export class SubscriptionRoute {

    route(): express.Router {
        const router = express.Router();

        // List subscriptions for the current tenant
        router.get('/subscriptions', async (req: any, res) => {
            try {
                const result = await req.db.client.query(
                    'SELECT id, plan, status, started_at, expires_at FROM subscriptions'
                );
                res.json({ success: true, data: result.rows, tenant: req.tenant?.id });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get a single subscription
        router.get('/subscriptions/:id', async (req: any, res) => {
            try {
                const result = await req.db.client.query(
                    'SELECT id, plan, status, started_at, expires_at FROM subscriptions WHERE id = $1',
                    [req.params.id]
                );
                if (!result.rows.length) {
                    return res.status(404).json({ success: false, error: 'Subscription not found' });
                }
                res.json({ success: true, data: result.rows[0] });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Create a subscription
        router.post('/subscriptions', async (req: any, res) => {
            try {
                const { plan } = req.body;
                const result = await req.db.client.query(
                    `INSERT INTO subscriptions (plan, status, started_at)
                     VALUES ($1, 'active', NOW())
                     RETURNING id, plan, status, started_at`,
                    [plan]
                );
                res.status(201).json({ success: true, data: result.rows[0] });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Cancel a subscription
        router.delete('/subscriptions/:id', async (req: any, res) => {
            try {
                await req.db.client.query(
                    `UPDATE subscriptions SET status = 'cancelled' WHERE id = $1`,
                    [req.params.id]
                );
                res.json({ success: true, message: 'Subscription cancelled' });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        return router;
    }
}
