import { z } from "zod";
import * as XLSX from "xlsx";

export class PartnerValidator {

    createPartner(req: any) {
        const schema = z.object({
            partner_code: z.string(),
            name: z.string(),
            partner_tier: z.enum(["STANDARD", "SILVER", "GOLD", "PLATINUM", "STRATEGIC"]),
            status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "ONBOARDING"]),
            client_count: z.coerce.number().optional(),
            email: z.string(),
            phone: z.string().optional(),
            contact_person_name: z.string().optional(),
            billing_currency: z.string(),
            commission_rate: z.coerce.number(),
            country: z.string().optional()
        });
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    getPartner(req: any) {
        return req.params?.id;
    }

    getPartners(req: any) {
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

    updatePartner(req: any) {
        const schema = z.object({
            partner_code: z.string().optional(),
            name: z.string().optional(),
            partner_tier: z.string().optional(),
            status: z.string().optional(),
            client_count: z.coerce.number().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            contact_person_name: z.string().optional(),
            billing_currency: z.string().optional(),
            commission_rate: z.coerce.number().optional(),
            country: z.string().optional()
        }).refine(data => Object.keys(data).length > 0, "No fields provided for update");
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    createAllPartners(req: any) {
        const body = Array.isArray(req.body) ? req.body : (req.body?.records || req.body?.data || []);
        const schema = z.array(z.object({
            partner_code: z.string(),
            name: z.string(),
            partner_tier: z.enum(["STANDARD", "SILVER", "GOLD", "PLATINUM", "STRATEGIC"]),
            status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "ONBOARDING"]),
            client_count: z.coerce.number().optional(),
            email: z.string(),
            phone: z.string().optional(),
            contact_person_name: z.string().optional(),
            billing_currency: z.string(),
            commission_rate: z.coerce.number(),
            country: z.string().optional()
        })).min(1, "At least one record is required");
        const result = schema.safeParse(body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateBulkPartners(req: any) {
        const updates = Array.isArray(req.body) ? req.body : (req.body?.updates || []);
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error("No bulk updates provided");
        }
        return updates;
    }

    updateAllPartners(req: any) {
        const ids = req.body?.ids || [];
        const data = req.body?.data || {};
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("IDs array required");
        if (Object.keys(data).length === 0) throw new Error("Update data required");
        return { ids, data };
    }

    deleteAllPartners(req: any) {
        const ids = req.body?.ids || (Array.isArray(req.body) ? req.body : []);
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("IDs array required");
        return ids;
    }

    deleteBulkPartners(req: any) {
        return this.deleteAllPartners(req);
    }

    importCreatePartners(req: any) {
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

    importUpdatePartners(req: any) {
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
            table_key: body.table_key || 'partners_table_5001'
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
            table_key: body.table_key || 'partners_table_5001'
        };
    }
}
