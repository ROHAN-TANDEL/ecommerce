import { z } from "zod";
import * as XLSX from "xlsx";

export class EmployeeValidator {

    createEmployee(req: any) {
        const schema = z.object({
            first_name: z.string(),
            last_name: z.string(),
            email: z.string(),
            department: z.string().optional(),
            role: z.string().optional(),
            salary: z.coerce.number().optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional(),
            hire_date: z.string().optional()
        });
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateEmployee(req: any) {
        const schema = z.object({
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            email: z.string().optional(),
            department: z.string().optional(),
            role: z.string().optional(),
            salary: z.coerce.number().optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional(),
            hire_date: z.string().optional()
        }).refine(data => Object.keys(data).length > 0, "No fields provided for update");
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    createAllemployees(req: any) {
        const schema = z.array(z.object({
            first_name: z.string(),
            last_name: z.string(),
            email: z.string(),
            department: z.string().optional(),
            role: z.string().optional(),
            salary: z.coerce.number().optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional(),
            hire_date: z.string().optional()
        })).min(1);
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateAllemployees(req: any) {
        const updateSchema = z.object({
            id: z.coerce.number().int().positive(),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            email: z.string().optional(),
            department: z.string().optional(),
            role: z.string().optional(),
            salary: z.coerce.number().optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional(),
            hire_date: z.string().optional()
        }).refine(({ id, ...data }) => Object.keys(data).length > 0, "No update fields provided");
        const validator = z.array(updateSchema).min(1);
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    deleteAllemployees(req: any) {
        const validator = z.object({
            ids: z.array(z.coerce.number().int())
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data.ids;
    }

    bulkSelection(req: any) {
        const validator = z.object({
            filters: z.record(z.string(), z.unknown()).default({}),
            sorts: z.array(z.object({ key: z.string(), direction: z.enum(['asc', 'desc']) })).default([]),
            excluded: z.array(z.coerce.number().int().positive()).default([])
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateStatus(req: any) {
        const validator = z.object({
            ids: z.array(z.coerce.number().int().positive()).min(1),
            status: z.enum(['active', 'inactive'])
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateBulkStatus(req: any) {
        const selection = this.bulkSelection(req);
        const status = z.enum(['active', 'inactive']).safeParse(req.body?.status);
        if (!status.success) throw new Error(JSON.stringify(status.error.format()));
        return { ...selection, status: status.data };
    }

    importCreateemployees(req: any) {
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

    importUpdateemployees(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        let rawRows: any[] = [];
        if (file && file.buffer) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (sheetName && workbook.Sheets[sheetName]) {
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            }
        }
        return { updates: rawRows, identifierKey: req.body?.identifier_key || 'email' };
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
            table_key: body.table_key || 'employees_table_1234'
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
            table_key: body.table_key || 'employees_table_1234'
        };
    }
}
