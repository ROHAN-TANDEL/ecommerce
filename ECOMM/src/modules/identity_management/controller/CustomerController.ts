import { CustomerColumnConfig, CustomerColumnOptionsConfig } from "../config/customer.column.config.js";
import { CustomerActionsConfig } from "../config/customer.actions.config.js";
import { CustomerHeaderConfig } from "../config/customer.header.config.js";
import { CustomerRowActionsConfig } from "../config/customer.row-actions.config.js";
import { CustomerTableConfig } from "../config/customer.table.config.js";

export class CustomerController {

    private readonly service: any;
    private readonly validator: any;

    constructor({ customerService, customerValidator }: any) {
        this.service = customerService;
        this.validator = customerValidator;
    }

    // ── Table Configurations ──
    async getTableConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: CustomerTableConfig });
    }

    async getColumnsConfig(req: any, res: any) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                columns: CustomerColumnConfig,
                options: CustomerColumnOptionsConfig
            }
        });
    }

    async getActionsConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: CustomerActionsConfig });
    }

    async getHeaderConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: CustomerHeaderConfig });
    }

    async getRowActionsConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: CustomerRowActionsConfig });
    }

    // ── CRUD Operations ──
    async create(req: any, res: any) {
        try {
            const inputs = this.validator.createCustomer(req);
            const data = await this.service.createCustomer(inputs);
            return res.status(200).json({ status: "success", code: 200, message: "Customer created successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Creation failed", data: null });
        }
    }

    async get(req: any, res: any) {
        try {
            const id = req.params?.id;
            const data = await this.service.getCustomer(id);
            return res.status(200).json({ status: "success", code: 200, data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Fetch failed", data: null });
        }
    }

    async list(req: any, res: any) {
        try {
            const page = parseInt(req.query?.page || '1', 10);
            const limit = parseInt(req.query?.limit || '10', 10);
            const result = await this.service.getcustomers(page, limit, req.query);
            return res.status(200).json({ status: "success", code: 200, data: result.records, pagination: result.pagination });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Listing failed", data: [] });
        }
    }

    async update(req: any, res: any) {
        try {
            const id = req.params?.id;
            const inputs = this.validator.updateCustomer(req);
            const data = await this.service.updateCustomer(id, inputs);
            return res.status(200).json({ status: "success", code: 200, message: "Customer updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Update failed", data: null });
        }
    }

    async delete(req: any, res: any) {
        try {
            const id = req.params?.id;
            const data = await this.service.deleteCustomer(id);
            return res.status(200).json({ status: "success", code: 200, message: "Customer deleted successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Deletion failed", data: null });
        }
    }

    async createAll(req: any, res: any) {
        try {
            const records = this.validator.createAllcustomers(req);
            const data = await this.service.createAllcustomers(records);
            return res.status(200).json({ status: "success", code: 200, message: "Batch creation successful", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch create failed", data: null });
        }
    }

    async updateAll(req: any, res: any) {
        try {
            const records = this.validator.updateAllcustomers(req);
            const data = await this.service.updateAllcustomers(records);
            return res.status(200).json({ status: "success", code: 200, message: "Batch update successful", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch update failed", data: null });
        }
    }

    async deleteAll(req: any, res: any) {
        try {
            const ids = this.validator.deleteAllcustomers(req);
            const data = await this.service.deleteAllcustomers(ids);
            return res.status(200).json({ status: "success", code: 200, message: "Batch deletion successful", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch delete failed", data: null });
        }
    }

    async importCreate(req: any, res: any) {
        try {
            const result = this.validator.importCreatecustomers(req);
            return res.status(200).json({ status: "success", code: 200, message: "Import parsed successfully", data: result });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import failed", data: null });
        }
    }

    async importUpdate(req: any, res: any) {
        try {
            const result = this.validator.importUpdatecustomers(req);
            return res.status(200).json({ status: "success", code: 200, message: "Import update parsed successfully", data: result });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import update failed", data: null });
        }
    }

    // ── AI Summary & Interact ──
    async aiSummary(req: any, res: any) {
        try {
            const inputs = this.validator.aiSummary(req);
            const isSelected = inputs.selected_row_ids && inputs.selected_row_ids.length > 0;
            const title = isSelected
                ? `Selected Rows Summary (${inputs.selected_row_ids.length} ${inputs.selected_row_ids.length > 1 ? 'customers' : 'Customer'})`
                : "customers Table Overview";

            const summary = isSelected
                ? `Summary of ${inputs.selected_row_ids.length} selected ${inputs.selected_row_ids.length > 1 ? 'customers' : 'customer'}.`
                : "This table manages customers across the system.";

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI summary generated successfully",
                data: {
                    type: isSelected ? "row_summary" : "table_summary",
                    title,
                    summary,
                    highlights: [
                        `Record count: ${isSelected ? inputs.selected_row_ids.length : 'All'}`,
                        `Filters: ${Object.keys(inputs.active_filters || {}).join(', ') || 'None'}`
                    ],
                    stats: {
                        count: inputs.selected_row_ids.length,
                        filters: inputs.active_filters
                    },
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
            let reply = "";
            let intent = "general";
            const actions: any = {
                filters: { set: {}, remove: [] },
                proposed_edits: [],
                generated_rows: [],
                requires_user_review: false
            };

            if (query.includes('clear filter') || query.includes('show all')) {
                intent = "filter_remove";
                actions.filters.remove_all = true;
                reply = "Cleared all filters.";
            } else if (query.includes('filter')) {
                intent = "filter_add";
                reply = "Applied filter based on your query.";
            } else if (query.includes('generate')) {
                intent = "generate";
                actions.generated_rows = [
                    {
                        temp_id: `ai_gen_${Date.now()}_1`,
                        status: "active",
                        is_ai_generated: true,
                        needs_review: true
                    }
                ];
                actions.requires_user_review = true;
                reply = "Generated sample draft records for review.";
            } else {
                reply = "AI processed your request for customers.";
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI processed query",
                data: { reply, intent, actions }
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "AI interaction failed", data: null });
        }
    }
}
