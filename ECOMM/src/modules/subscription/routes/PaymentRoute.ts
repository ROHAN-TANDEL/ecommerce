import express from 'express';

export class PaymentRoute {

    route(): express.Router {
        const router = express.Router();

        // List payments for the current tenant
        router.get('/payments', async (req: any, res) => {
            try {
                const result = await req.db.client.query(
                    'SELECT id, amount, method, status, paid_at FROM payments ORDER BY paid_at DESC'
                );
                res.json({ success: true, data: result.rows, tenant: req.tenant?.id });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get a single payment
        router.get('/payments/:id', async (req: any, res) => {
            try {
                const result = await req.db.client.query(
                    'SELECT id, amount, method, status, paid_at FROM payments WHERE id = $1',
                    [req.params.id]
                );
                if (!result.rows.length) {
                    return res.status(404).json({ success: false, error: 'Payment not found' });
                }
                res.json({ success: true, data: result.rows[0] });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Record a payment
        router.post('/payments', async (req: any, res) => {
            try {
                const { amount, method, invoice_id } = req.body;
                const result = await req.db.client.query(
                    `INSERT INTO payments (amount, method, invoice_id, status, paid_at)
                     VALUES ($1, $2, $3, 'completed', NOW())
                     RETURNING id, amount, method, status, paid_at`,
                    [amount, method, invoice_id]
                );
                res.status(201).json({ success: true, data: result.rows[0] });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        return router;
    }
}
