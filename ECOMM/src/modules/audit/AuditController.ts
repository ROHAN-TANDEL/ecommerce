import { randomUUID } from "crypto";

export default class AuditController {

    constructor(public readonly context: any) {}

    getAuditLogs = async (req: any, res: any) => {
        try {
            const { entity, user_id, action, from, to } = req.query;

            let query = `SELECT * FROM master.audit_logs WHERE 1=1`;
            const params: any[] = [];
            let idx = 1;

            if (entity) {
                query += ` AND entity = $${idx++}`;
                params.push(entity);
            }
            if (user_id) {
                query += ` AND user_id = $${idx++}`;
                params.push(user_id);
            }
            if (action) {
                query += ` AND action = $${idx++}`;
                params.push(action);
            }
            if (from) {
                query += ` AND created_at >= $${idx++}`;
                params.push(from);
            }
            if (to) {
                query += ` AND created_at <= $${idx++}`;
                params.push(to);
            }

            query += ` ORDER BY created_at DESC`;

            const result = await this.context.client.query(query, params);
            return res.status(200).json({
                status: "success",
                data: result.rows
            });
        } catch (error) {
            console.error("Audit error:", error);
            return res.status(500).json({ status: "failed", message: error.message });
        }
    };

    getAuditLog = async (req: any, res: any) => {
        try {
            const auditId = req.params.id;
            const query = `SELECT * FROM master.audit_logs WHERE id = $1`;
            const result = await this.context.client.query(query, [auditId]);

            if (!result.rows.length) {
                return res.status(404).json({ status: "failed", message: "audit log not found" });
            }
            return res.status(200).json({ status: "success", data: result.rows[0] });
        } catch (error) {
            console.error("Audit error:", error);
            return res.status(500).json({ status: "failed", message: error.message });
        }
    };

    insertAuditLog = async (params: {
        action: string;
        entity: string;
        entity_id: string;
        user_id?: number;
        metadata?: object;
        ip_address?: string;
        user_agent?: string;
        correlation_id?: string;
    }) => {
        try {
            const query = `
                INSERT INTO master.audit_logs
                    (event_id, correlation_id, user_id, action, entity, entity_id, metadata, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            await this.context.client.query(query, [
                randomUUID(),
                params.correlation_id ?? randomUUID(),
                params.user_id ?? null,
                params.action,
                params.entity,
                params.entity_id,
                params.metadata ? JSON.stringify(params.metadata) : null,
                params.ip_address ?? null,
                params.user_agent ?? null
            ]);
        } catch (error) {
            console.error("Audit insert error:", error);
        }
    };
}
