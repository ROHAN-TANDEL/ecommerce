import express from 'express';

export class InvoiceRoute {

    route(): express.Router {
        const router = express.Router();

        // List invoices for the current tenant
        router.get('/invoices', async (req: any, res) => {
            try {
                const result = await req.db.client.query(
                    'SELECT id, amount, status, issued_at, due_at FROM invoices ORDER BY issued_at DESC'
                );
                res.json({ success: true, data: result.rows, tenant: req.tenant?.id });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get a single invoice
        router.get('/invoices/:id', async (req: any, res) => {
            try {
                const result = await req.db.client.query(
                    'SELECT id, amount, status, issued_at, due_at FROM invoices WHERE id = $1',
                    [req.params.id]
                );
                if (!result.rows.length) {
                    return res.status(404).json({ success: false, error: 'Invoice not found' });
                }
                res.json({ success: true, data: result.rows[0] });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        return router;
    }
}
