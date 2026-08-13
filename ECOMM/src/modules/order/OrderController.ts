import AuditController from "../audit/AuditController.js";

export default class OrderController {

    constructor(public readonly context: any) {}

    getOrders = async (req: any, res: any) => {
        try {
            const { status } = req.query;
            let query = `SELECT * FROM master.orders WHERE 1=1`;
            const params: any[] = [];
            let idx = 1;

            if (status) {
                query += ` AND status = $${idx++}`;
                params.push(status);
            }

            query += ` ORDER BY created_at DESC`;
            const result = await this.context.client.query(query, params);
            return res.status(200).json({ status: "success", data: result.rows });
        } catch (error: any) {
            console.error("Order error:", error);
            return res.status(500).json({ status: "failed", message: error.message });
        }
    };

    getOrder = async (req: any, res: any) => {
        try {
            const orderId = req.params.id;
            const orderQuery = `SELECT * FROM master.orders WHERE id = $1`;
            const order = await this.context.client.query(orderQuery, [orderId]);

            if (!order.rows.length) {
                return res.status(404).json({ status: "failed", message: "order not found" });
            }

            const itemsQuery = `SELECT * FROM master.order_items WHERE order_id = $1`;
            const items = await this.context.client.query(itemsQuery, [orderId]);

            return res.status(200).json({
                status: "success",
                data: { ...order.rows[0], items: items.rows }
            });
        } catch (error: any) {
            console.error("Order error:", error);
            return res.status(500).json({ status: "failed", message: error.message });
        }
    };

    getUserOrders = async (req: any, res: any) => {
        try {
            const userId = req.params.userId;
            const query = `SELECT * FROM master.orders WHERE user_id = $1 ORDER BY created_at DESC`;
            const result = await this.context.client.query(query, [userId]);
            return res.status(200).json({ status: "success", data: result.rows });
        } catch (error: any) {
            console.error("Order error:", error);
            return res.status(500).json({ status: "failed", message: error.message });
        }
    };
}
