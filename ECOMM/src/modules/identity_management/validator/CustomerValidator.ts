import { z } from "zod";
import * as XLSX from "xlsx";

export class CustomerValidator {

    createCustomer(req: any) {
        const schema = z.object({
            customer_code: z.string(),
            customer_name: z.string(),
            legal_name: z.string().optional(),
            status: z.enum(["Active", "Pending", "Suspended", "Inactive"]),
            customer_type: z.enum(["Enterprise", "Mid-Market", "SMB", "Individual", "Government"]).optional(),
            industry: z.string().optional(),
            risk_level: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            website: z.string().optional(),
            owner_name: z.string().optional(),
            owner_email: z.string().optional(),
            country: z.string().optional(),
            country_code: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postal_code: z.string().optional(),
            address: z.string().optional(),
            annual_revenue: z.coerce.number().optional(),
            currency: z.enum(["USD", "EUR", "GBP", "INR", "CAD", "AUD"]).optional(),
            employee_count: z.coerce.number().optional(),
            onboarding_date: z.string().optional(),
            last_activity_at: z.string().optional(),
            is_active: z.coerce.boolean().optional(),
            editable: z.coerce.boolean().optional()
        });
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    getCustomer(req: any) {
        return req.params?.id;
    }

    getCustomers(req: any) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const query = (req.query && typeof req.query === 'object') ? req.query : {};

        let pageRaw = body.page ?? query.page ?? 1;
        let limitRaw = body.limit ?? query.limit ?? 25;

        const page = Number(pageRaw) > 0 ? Number(pageRaw) : 1;
        const limit = Number(limitRaw) > 0 ? Number(limitRaw) : 25;

        let filters: any = {};
        if (body.filters !== undefined) {
            filters = body.filters;
        } else if (query.filters !== undefined) {
            filters = query.filters;
        }

        if (typeof filters === 'string') {
            try {
                filters = JSON.parse(filters);
            } catch (_) {
                filters = {};
            }
        }
        if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
            filters = {};
        }

        let sort: any = body.sort ?? query.sort ?? null;
        if (typeof sort === 'string' && (sort.startsWith('{') || sort.startsWith('['))) {
            try {
                sort = JSON.parse(sort);
            } catch (_) {}
        }

        const mergedInputs: any = {
            ...query,
            ...body,
            page,
            limit,
            filters: { ...filters },
            sort: sort ?? (query.sort || body.sort)
        };

        // Unpack any individual query parameters that were stringified
        for (const [k, v] of Object.entries(mergedInputs)) {
            if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) {
                try {
                    mergedInputs[k] = JSON.parse(v);
                } catch (_) {}
            }
        }

        for (const [k, v] of Object.entries(filters)) {
            if (mergedInputs[k] === undefined) {
                mergedInputs[k] = v;
            }
        }

        return mergedInputs;
    }

    updateCustomer(req: any) {
        const schema = z.object({
            customer_code: z.string().optional(),
            customer_name: z.string().optional(),
            legal_name: z.string().optional(),
            status: z.string().optional(),
            customer_type: z.string().optional(),
            industry: z.string().optional(),
            risk_level: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            website: z.string().optional(),
            owner_name: z.string().optional(),
            owner_email: z.string().optional(),
            country: z.string().optional(),
            country_code: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postal_code: z.string().optional(),
            address: z.string().optional(),
            annual_revenue: z.coerce.number().optional(),
            currency: z.string().optional(),
            employee_count: z.coerce.number().optional(),
            onboarding_date: z.string().optional(),
            last_activity_at: z.string().optional(),
            is_active: z.coerce.boolean().optional(),
            editable: z.coerce.boolean().optional()
        }).refine(data => Object.keys(data).length > 0, "No fields provided for update");
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    createAllCustomers(req: any) {
        const body = Array.isArray(req.body) ? req.body : (req.body?.records || req.body?.data || []);
        const schema = z.array(z.object({
            customer_code: z.string(),
            customer_name: z.string(),
            legal_name: z.string().optional(),
            status: z.enum(["Active", "Pending", "Suspended", "Inactive"]),
            customer_type: z.enum(["Enterprise", "Mid-Market", "SMB", "Individual", "Government"]).optional(),
            industry: z.string().optional(),
            risk_level: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            website: z.string().optional(),
            owner_name: z.string().optional(),
            owner_email: z.string().optional(),
            country: z.string().optional(),
            country_code: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postal_code: z.string().optional(),
            address: z.string().optional(),
            annual_revenue: z.coerce.number().optional(),
            currency: z.enum(["USD", "EUR", "GBP", "INR", "CAD", "AUD"]).optional(),
            employee_count: z.coerce.number().optional(),
            onboarding_date: z.string().optional(),
            last_activity_at: z.string().optional(),
            is_active: z.coerce.boolean().optional(),
            editable: z.coerce.boolean().optional()
        })).min(1, "At least one record is required");
        const result = schema.safeParse(body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateBulkCustomers(req: any) {
        const updates = Array.isArray(req.body) ? req.body : (req.body?.updates || []);
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error("No bulk updates provided");
        }
        return updates;
    }

    updateAllCustomers(req: any) {
        const ids = req.body?.ids || [];
        const data = req.body?.data || {};
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("IDs array required");
        if (Object.keys(data).length === 0) throw new Error("Update data required");
        return { ids, data };
    }

    deleteAllCustomers(req: any) {
        const ids = req.body?.ids || (Array.isArray(req.body) ? req.body : []);
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("IDs array required");
        return ids;
    }

    deleteBulkCustomers(req: any) {
        return this.deleteAllCustomers(req);
    }

    importCreateCustomers(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        let rawRows: any[] = [];
        if (file && file.buffer) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (sheetName && workbook.Sheets[sheetName]) {
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            }
        }
        return { records: rawRows, file: file?.originalname };
    }

    importUpdateCustomers(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        let rawRows: any[] = [];
        if (file && file.buffer) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (sheetName && workbook.Sheets[sheetName]) {
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            }
        }
        return { updates: rawRows, identifierKey: req.body?.identifier_key || 'id' };
    }

    aiSummary(req: any) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const rawIds = body.selected_row_ids || body.row_ids || [];
        const rawRows = body.selected_rows || body.rows_sample || [];
        const rawFilters = body.active_filters || body.filters || {};
        return {
            selected_row_ids: Array.isArray(rawIds) ? rawIds.map(String) : [],
            selected_rows: Array.isArray(rawRows) ? rawRows : [],
            active_filters: (rawFilters && typeof rawFilters === 'object') ? rawFilters : {},
            table_key: body.table_key || 'customers_table_1234'
        };
    }

    aiInteract(req: any) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const query = typeof body.query === 'string' ? body.query.trim() : '';
        if (!query) throw new Error("Query is required for AI interaction");
        return {
            query,
            columns: Array.isArray(body.columns) ? body.columns : [],
            current_rows: Array.isArray(body.current_rows) ? body.current_rows : [],
            selected_row_ids: Array.isArray(body.selected_row_ids) ? body.selected_row_ids.map(String) : [],
            active_filters: (body.active_filters && typeof body.active_filters === 'object') ? body.active_filters : {},
            table_key: body.table_key || 'customers_table_1234'
        };
    }
}
