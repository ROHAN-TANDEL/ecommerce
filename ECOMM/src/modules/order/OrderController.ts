import AuditController from "../audit/AuditController.js";
import { OrderStatus } from "./OrderTypes.js";

export default class OrderController {

    audit: AuditController;

    constructor(public readonly context: any) {
        this.audit = new AuditController(context);
    }

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
            console.log("order by ");
            const orderId = req.params.id;
            const orderQuery = `
                SELECT
                    o.*,
                    json_build_object(
                            'first_name', u.first_name,
                            'last_name', u.last_name,
                            'email', u.email
                    ) as user,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id', oi.id,
                            'order_id', oi.order_id,
                            'product_id', oi.product_id,
                            'quantity', oi.quantity,
                            'unit_price', oi.unit_price,
                            'line_total', oi.line_total,
                            'created_at', oi.created_at,
                            'product', json_build_object(
                                'id', p.id,
                                'name', p.name,
                                'sku', p.sku,
                                'description', p.description,
                                'price', p.price,
                                'stock_quantity', p.stock_quantity,
                                'status', p.status
                            )
                        )
                    )
                    FROM master.order_items oi
                    LEFT JOIN master.products p ON oi.product_id = p.id
                    WHERE oi.order_id = o.id
                    ),
                    '[]'::json
                ) as items
                FROM master.orders o
                    LEFT JOIN master.users u ON o.user_id = u.id
                WHERE o.id = $1
                GROUP BY o.id, u.id;
            `;
            const order = await this.context.client.query(orderQuery, [orderId]);

            if (!order.rows.length) {
                return res.status(404).json({ status: "failed", message: "order not found" });
            }

            return res.status(200).json({
                status: "success",
                data: order.rows[0]
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

    public updateOrderStatus = async (req: any, res: any) => {
        try {
            const orderId = req.params.id;
            const { status } = req.body;

            const validStatuses = Object.values(OrderStatus);
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: "failed",
                    message: `Invalid status. Valid values: ${validStatuses.join(", ")}`
                });
            }

            const query = `
                UPDATE master.orders
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING id, order_number, status, updated_at
            `;
            const result = await this.context.client.query(query, [status, orderId]);

            if (!result.rowCount) {
                return res.status(404).json({ status: "failed", message: "order not found" });
            }

            await this.audit.insertAuditLog({
                action: "ORDER_UPDATED",
                entity: "orders",
                entity_id: String(orderId),
                user_id: req.user?.id,
                metadata: { status },
                ip_address: req.ip,
                user_agent: req.headers["user-agent"],
                correlation_id: req.id
            });

            return res.status(200).json({ status: "success", data: result.rows[0] });
        } catch (error: any) {
            console.error("Order error:", error);
            return res.status(500).json({ status: "failed", message: error.message });
        }
    };
}
