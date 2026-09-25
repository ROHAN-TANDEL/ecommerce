import { TenantProvisioner } from "./TenantProvisioner.js";

export default class TenantController {

    constructor(private readonly context: any) {}

    /**
     * POST /tenants
     * Body: { tenant_name: string }
     *
     * 1. Inserts into master.tenants (status = PROVISIONING)
     * 2. Provisions a new schema in the client database
     * 3. Updates master.tenants status to READY
     */
    create = async (req: any, res: any): Promise<void> => {
        const { tenant_name } = req.body;

        if (!tenant_name || typeof tenant_name !== "string" || tenant_name.trim() === "") {
            res.status(400).json({
                status: "failed",
                message: "tenant_name is required",
            });
            return;
        }

        let tenantId: number | null = null;

        try {
            // ── 1. Create tenant record in master (PROVISIONING) ──────────
            const insert = await this.context.client.query(
                `INSERT INTO master.tenants (tenant_name, status)
                 VALUES ($1, 'PROVISIONING')
                 RETURNING id`,
                [tenant_name.trim()]
            );

            tenantId = Number(insert.rows[0].id);

            // ── 2. Provision schema + tables in client database ───────────
            const provisioner = new TenantProvisioner(this.context);
            try {
                await provisioner.provision(tenantId);
            } finally {
                await provisioner.close();
            }

            // ── 3. Mark READY ─────────────────────────────────────────────
            await this.context.client.query(
                `UPDATE master.tenants
                 SET status = 'READY', updated_at = NOW()
                 WHERE id = $1`,
                [tenantId]
            );

            res.status(201).json({
                status: "success",
                data: {
                    id:          tenantId,
                    tenant_name: tenant_name.trim(),
                    schema:      `tenant_${tenantId}`,
                    db:          this.context.env.PG_IAM_CLIENT_DATABASE ?? "identity_access_management_client",
                },
            });

        } catch (err: any) {
            console.error("[tenant] provisioning failed:", err);

            // Mark PROVISIONING_FAILED if we got an id
            if (tenantId !== null) {
                await this.context.client.query(
                    `UPDATE master.tenants
                     SET status = 'PROVISIONING_FAILED', updated_at = NOW()
                     WHERE id = $1`,
                    [tenantId]
                ).catch(() => {});
            }

            res.status(500).json({
                status: "failed",
                message: "tenant provisioning failed",
                detail: err.message,
            });
        }
    };

    /**
     * GET /tenants
     * Lists all tenants from master.tenants
     */
    list = async (_req: any, res: any): Promise<void> => {
        try {
            const result = await this.context.client.query(
                `SELECT id, tenant_name, status, created_at, updated_at
                 FROM master.tenants
                 ORDER BY id ASC`
            );

            res.status(200).json({
                status: "success",
                data: result.rows,
            });
        } catch (err: any) {
            console.error("[tenant] list failed:", err);
            res.status(500).json({ status: "failed", message: err.message });
        }
    };

    /**
     * GET /tenants/:id
     */
    get = async (req: any, res: any): Promise<void> => {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            res.status(400).json({ status: "failed", message: "invalid tenant id" });
            return;
        }

        try {
            const result = await this.context.client.query(
                `SELECT id, tenant_name, status, created_at, updated_at
                 FROM master.tenants
                 WHERE id = $1`,
                [id]
            );

            if (result.rowCount === 0) {
                res.status(404).json({ status: "failed", message: "tenant not found" });
                return;
            }

            res.status(200).json({ status: "success", data: result.rows[0] });
        } catch (err: any) {
            console.error("[tenant] get failed:", err);
            res.status(500).json({ status: "failed", message: err.message });
        }
    };
}
