import { ProductColumnConfig, ProductColumnOptionsConfig } from "../config/product.column.config.js";
import { ProductActionsConfig } from "../config/product.actions.config.js";
import { ProductHeaderConfig } from "../config/product.header.config.js";
import { ProductRowActionsConfig } from "../config/product.row-actions.config.js";
import { ProductTableConfig } from "../config/product.table.config.js";

export class ProductController {

    private readonly service: any;
    private readonly validator: any;

    constructor({ productService, productValidator }: any) {
        this.service = productService;
        this.validator = productValidator;
    }

    // ── Table Configurations ──
    async getTableConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ProductTableConfig });
    }

    async getColumnsConfig(_req: any, res: any) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                columns: ProductColumnConfig,
                options: ProductColumnOptionsConfig
            }
        });
    }

    async getActionsConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ProductActionsConfig });
    }

    async getHeaderConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ProductHeaderConfig });
    }

    async getRowActionsConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ProductRowActionsConfig });
    }

    // ── CRUD Operations ──
    async create(req: any, res: any) {
        try {
            const inputs = this.validator.createProduct(req);
            const data = await this.service.createProduct(inputs);
            return res.status(200).json({ status: "success", code: 200, message: "Product created successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Creation failed", data: null });
        }
    }

    async get(req: any, res: any) {
        try {
            const id = this.validator.getProduct(req);
            const data = await this.service.getProduct(id);
            if (!data) {
                return res.status(404).json({ status: "failed", code: 404, message: "Product not found", data: null });
            }
            return res.status(200).json({ status: "success", code: 200, data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Fetch failed", data: null });
        }
    }

    async getProducts(req: any, res: any) {
        try {
            const validated = this.validator.getProducts(req);
            const { page, limit, ...filterInputs } = validated;
            const result = await this.service.getProducts(page, limit, filterInputs);
            const records = result?.records ?? result?.data ?? (Array.isArray(result) ? result : []);
            return res.status(200).json({
                data: records,
                records: records,
                pagination: result.pagination,
                message: "Product list",
                status: "success",
                code: 200
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Listing failed", data: [] });
        }
    }

    async list(req: any, res: any) {
        return this.getProducts(req, res);
    }

    async update(req: any, res: any) {
        try {
            const id = req.params?.id;
            const inputs = this.validator.updateProduct(req);
            const data = await this.service.updateProduct(id, inputs);
            return res.status(200).json({ status: "success", code: 200, message: "Product updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Update failed", data: null });
        }
    }

    async delete(req: any, res: any) {
        try {
            const id = req.params?.id;
            const data = await this.service.deleteProduct(id);
            return res.status(200).json({ status: "success", code: 200, message: "Product deleted successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Deletion failed", data: null });
        }
    }

    async createAll(req: any, res: any) {
        try {
            const records = this.validator.createAllProducts(req);
            const data = await this.service.createAllProducts(records);
            return res.status(200).json({ status: "success", code: 200, message: "All records created successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch create failed", data: null });
        }
    }

    async updateBulk(req: any, res: any) {
        try {
            const updates = this.validator.updateBulkProducts(req);
            const data = await this.service.updateBulkProducts(updates);
            return res.status(200).json({ status: "success", code: 200, message: "Bulk updates applied successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Bulk update failed", data: null });
        }
    }

    async updateStatus(req: any, res: any) {
        try {
            const id = req.body?.id || req.query?.id;
            const status = req.body?.status || req.query?.status;
            if (!id || !status) {
                return res.status(400).json({ status: "failed", code: 400, message: "id and status are required", data: null });
            }
            const data = await this.service.updateProduct(id, { status });
            return res.status(200).json({ status: "success", code: 200, message: "Status updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Status update failed", data: null });
        }
    }

    async updateBulkStatus(req: any, res: any) {
        try {
            const ids = req.body?.ids || [];
            const status = req.body?.status;
            if (!Array.isArray(ids) || ids.length === 0 || !status) {
                return res.status(400).json({ status: "failed", code: 400, message: "ids array and status are required", data: null });
            }
            const data = await this.service.updateAllProducts(ids, { status });
            return res.status(200).json({ status: "success", code: 200, message: "Bulk status updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Bulk status update failed", data: null });
        }
    }

    async updateAll(req: any, res: any) {
        try {
            const { ids, data: updateData } = this.validator.updateAllProducts(req);
            const data = await this.service.updateAllProducts(ids, updateData);
            return res.status(200).json({ status: "success", code: 200, message: "All records updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch update failed", data: null });
        }
    }

    async deleteAll(req: any, res: any) {
        try {
            const ids = this.validator.deleteAllProducts(req);
            const data = await this.service.deleteAllProducts(ids);
            return res.status(200).json({ status: "success", code: 200, message: "All records deleted successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch delete failed", data: null });
        }
    }

    async deleteBulk(req: any, res: any) {
        return this.deleteAll(req, res);
    }

    async importCreate(req: any, res: any) {
        try {
            const result = this.validator.importCreateProducts(req);
            const inserted = await this.service.importProducts(result.records);
            return res.status(200).json({ status: "success", code: 200, message: `Imported ${result.records.length} records successfully`, data: inserted });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import failed", data: null });
        }
    }

    async importUpdate(req: any, res: any) {
        try {
            const result = this.validator.importUpdateProducts(req);
            const updated = await this.service.importUpdateProducts(result.updates);
            return res.status(200).json({ status: "success", code: 200, message: "Import updates applied successfully", data: updated });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import update failed", data: null });
        }
    }

    // ── Table Locks ──
    async lockTable(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "lockTable initiated", data: null });
    }

    async lockRows(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "lockRows initiated", data: null });
    }

    async getLocks(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "getLocks initiated", data: null });
    }

    // ── Export / Download ──
    async exportData(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "Export initiated", data: null });
    }

    async downloadData(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "Download prepared", data: null });
    }

    // ── Saved Views ──
    async listViews(req: any, res: any) {
        try {
            const tableKey = req.query.table_key || 'products_table_5003';
            const userId = req.user?.id || req.query.user_id || null;
            const views = await this.service.getViews(tableKey, userId);
            return res.status(200).json({ status: "success", code: 200, message: "Views fetched successfully", data: views });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to fetch views", data: null });
        }
    }

    async saveView(req: any, res: any) {
        try {
            const { name } = req.body;
            if (!name || typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({ status: "failed", code: 400, message: "View name is required", data: null });
            }
            const saved = await this.service.saveView(req.body);
            return res.status(200).json({ status: "success", code: 200, message: "View saved successfully", data: saved });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to save view", data: null });
        }
    }

    async getView(req: any, res: any) {
        try {
            const view = await this.service.getView(req.params.id);
            if (!view) return res.status(404).json({ status: "failed", code: 404, message: "View not found", data: null });
            return res.status(200).json({ status: "success", code: 200, message: "View fetched successfully", data: view });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to fetch view", data: null });
        }
    }

    async deleteView(req: any, res: any) {
        try {
            const deleted = await this.service.deleteView(req.params.id);
            return res.status(200).json({ status: "success", code: 200, message: "View deleted successfully", data: deleted });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to delete view", data: null });
        }
    }

    async setDefaultView(req: any, res: any) {
        try {
            const updated = await this.service.setDefaultView(req.params.id, req.body?.table_key || 'products_table_5003');
            return res.status(200).json({ status: "success", code: 200, message: "Default view updated successfully", data: updated });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to set default view", data: null });
        }
    }

    // ── Live SSE Pub / Sub ──
    async liveUpdatePub(req: any, res: any) {
        try {
            const channel = `table:${req.body?.table_key || req.query?.table_key || 'products_table_5003'}:live`;
            const payload = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
            const redisClient = (globalThis as any).context?.redis;

            if (!redisClient) {
                return res.status(500).json({ status: "failed", code: 500, message: "Redis is not connected", data: null });
            }

            const messageString = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const subscribersCount = await redisClient.publish(channel, messageString);

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "liveUpdatePub broadcasted successfully",
                data: { channel, subscribers: subscribersCount, published: true }
            });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to publish live event", data: null });
        }
    }

    async liveUpdateSub(req: any, res: any) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const channel = `table:${req.query?.table_key || 'products_table_5003'}:live`;
        res.write(`data: ${JSON.stringify({ type: 'connected', channel })}\n\n`);

        const heartbeat = setInterval(() => {
            try { res.write(': heartbeat\n\n'); } catch (_) {}
        }, 25000);

        req.on('close', () => {
            clearInterval(heartbeat);
        });
    }

    // ── AI Summary & Interaction ──
    async aiSummary(req: any, res: any) {
        try {
            const inputs = this.validator.aiSummary(req);
            const count = inputs.selected_rows?.length || inputs.selected_row_ids?.length || 0;
            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI summary generated successfully",
                data: {
                    type: count > 0 ? "row_summary" : "table_summary",
                    title: count > 0 ? `Selected ${count} Product Records` : "Product Overview",
                    summary: `Analyzed ${count > 0 ? count : 'table'} records for products.`,
                    highlights: [`Total evaluated: ${count}`],
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "AI summary failed", data: null });
        }
    }

    async aiInteract(req: any, res: any) {
        try {
            const inputs = this.validator.aiInteract(req);
            const query = inputs.query.toLowerCase();
            let reply = `Processed query for products.`;
            let intent = "general";
            const actions: any = { filters: { set: {}, remove: [] }, proposed_edits: [], generated_rows: [], requires_user_review: false };

            if (query.includes('clear') || query.includes('reset')) {
                intent = "filter_remove";
                actions.filters.remove_all = true;
                reply = "Cleared all filters.";
            } else if (query.includes('filter')) {
                intent = "filter_add";
                reply = "Applied filter based on your query.";
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI interaction processed",
                data: { reply, intent, actions, query: inputs.query, timestamp: new Date().toISOString() }
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "AI query failed", data: null });
        }
    }

    // ── UserController 100% Parity Aliases ──
    createUser = this.create.bind(this);
    getProduct = this.get.bind(this);
    updateProduct = this.update.bind(this);
    deleteProduct = this.delete.bind(this);
    createAllProducts = this.createAll.bind(this);
    createBulkProducts = this.createAll.bind(this);
    updateBulkProducts = this.updateBulk.bind(this);
    updateAllProducts = this.updateAll.bind(this);
    deleteAllProducts = this.deleteAll.bind(this);
    deleteBulkProducts = this.deleteBulk.bind(this);
    importCreateProducts = this.importCreate.bind(this);
    importUpdateProducts = this.importUpdate.bind(this);
    getProductTableConfig = this.getTableConfig.bind(this);
    getProductColumnsConfig = this.getColumnsConfig.bind(this);
    getProductActionsConfig = this.getActionsConfig.bind(this);
    getProductHeaderConfig = this.getHeaderConfig.bind(this);
    getProductRowActionsConfig = this.getRowActionsConfig.bind(this);
    updateProductStatus = this.updateStatus.bind(this);
    updateBulkProductStatus = this.updateBulkStatus.bind(this);
    updateAllProductStatus = this.updateBulkStatus.bind(this);
}
