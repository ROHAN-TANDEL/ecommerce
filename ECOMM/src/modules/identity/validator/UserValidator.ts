import { z } from 'zod';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

export class UserValidator {

    createUser(req)
    {
        const validator = z.object({
            first_name: z.string().min(1, "First name is required"),
            last_name: z.string().min(1, "Last name is required"),
            email: z.string().email("Invalid email address"),
            password_hash: z.string().min(2, "Password must be at least 6 characters"),
            status: z.enum(["active", "inactive", "pending"]).default("active"),
        });

        const result = validator.safeParse(req.body);

        if (!result.success) {
            // Throw the Zod errors to be caught by the controller's try/catch block
            throw new Error(JSON.stringify(result.error.format()));
        }

        // 3. Extract data values into an array in a predictable order
        const { first_name, last_name, email, password_hash, status } = result.data;

        return [first_name, last_name, email, password_hash, status.toUpperCase()];
    }


    getUser(req)
    {
        const validator = z.object({
            id: z.coerce.number().int({ message: "invalid user id" })
        });

        const result = validator.safeParse(req.params);

        if (!result.success) {
            // Throw the Zod errors to be caught by the controller's try/catch block
            throw new Error(JSON.stringify(result.error.format()));
        }

        // 3. Extract data values into an array in a predictable order
        const { id } = result.data;

        return [id];
    }

    getUsers(req)
    {
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

        for (const [k, v] of Object.entries(filters)) {
            if (mergedInputs[k] === undefined) {
                mergedInputs[k] = v;
            }
        }

        return mergedInputs;
    }

    updateUsers(req)
    {
        const validateBody = z.object({
                        first_name: z.string().min(1, "First name cannot be empty").optional(),
                        last_name: z.string().min(1, "Last name cannot be empty").optional(),
                        email: z.string().email("Invalid email format").optional(),
                        password_hash: z.string().min(6, "Password hash too short").optional(),
                        status: z.enum(['active', 'inactive', 'pending']).optional()
                    });

        const validatedBody = validateBody.safeParse(req.body);

        if (!validatedBody.success) {
            // Throw the Zod errors to be caught by the controller's try/catch block
            throw new Error(JSON.stringify(result.error.format()));
        }


        const validateParams = z.object({
            id: z.coerce.number().int({ message: "Invalid user ID" })
        });

        const validatedParams = validateParams.safeParse(req.params);

        if (!validatedParams.success) {
            // Throw the Zod errors to be caught by the controller's try/catch block
            throw new Error(JSON.stringify(result.error.format()));
        }

        return {
            params : validatedParams.data,
            body : validatedBody.data
        };
    }
    createBulkUsers(req) {
        const userSchema = z.object({
            first_name: z.string().min(1, "First name is required"),
            last_name: z.string().min(1, "Last name is required"),
            email: z.string().email("Invalid email address"),
            password_hash: z.string().min(2, "Password must be at least 2 characters").optional(),
            password: z.string().min(2, "Password must be at least 2 characters").optional(),
            status: z.preprocess(
                val => typeof val === 'string' ? val.toLowerCase() : val,
                z.enum(["active", "inactive", "pending"])
            ).default("active"),
        }).refine(data => data.password_hash || data.password, {
            message: "Password is required",
            path: ["password_hash"]
        });
        const validator = z.array(userSchema).min(1, "At least one user must be provided");
        const result = validator.safeParse(req.body);

        if (!result.success) throw new Error(JSON.stringify(result.error.format()));

        return result.data.map(u => [
            u.first_name,
            u.last_name,
            u.email,
            (u.password_hash || u.password)!,
            u.status.toUpperCase()
        ]);
    }

    createAllUsers(req) {
        return this.createBulkUsers(req);
    }

    updateBulkUsers(req) {
        const updateData = z.object({
            first_name: z.string().min(1).optional(),
            last_name: z.string().min(1).optional(),
            email: z.string().email().optional(),
            password_hash: z.string().min(6).optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional()
        }).refine(data => Object.keys(data).length > 0, 'fields not provided for update');
        const validator = z.object({
            data: updateData,
            filters: z.record(z.string(), z.unknown()).default({}),
            sorts: z.array(z.object({ key: z.string(), direction: z.enum(['asc', 'desc']) })).default([]),
            excluded: z.array(z.coerce.number().int().positive()).default([])
        });
        const result = validator.safeParse(req.body);

        if (!result.success) throw new Error(JSON.stringify(result.error.format()));

        return result.data;
    }

    updateAllUsers(req) {
        const updateSchema = z.object({
            id: z.coerce.number().int().positive(),
            first_name: z.string().min(1).optional(),
            last_name: z.string().min(1).optional(),
            email: z.string().email().optional(),
            password_hash: z.string().min(6).optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional()
        }).refine(({ id, ...data }) => Object.keys(data).length > 0, 'fields not provided for update');
        const validator = z.array(updateSchema).min(1);
        const result = validator.safeParse(req.body);

        if (!result.success) throw new Error(JSON.stringify(result.error.format()));

        return result.data;
    }

    deleteAllUsers(req) {
        const validator = z.object({
            ids: z.array(z.coerce.number().int())
        });
        const result = validator.safeParse(req.body);

        if (!result.success) throw new Error(JSON.stringify(result.error.format()));

        return result.data.ids;
    }

    bulkSelection(req) {
        const validator = z.object({
            filters: z.record(z.string(), z.unknown()).default({}),
            sorts: z.array(z.object({ key: z.string(), direction: z.enum(['asc', 'desc']) })).default([]),
            excluded: z.array(z.coerce.number().int().positive()).default([])
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateStatus(req) {
        const validator = z.object({
            ids: z.array(z.coerce.number().int().positive()).min(1),
            status: z.enum(['active', 'inactive'])
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateBulkStatus(req) {
        const selection = this.bulkSelection(req);
        const status = z.enum(['active', 'inactive']).safeParse(req.body?.status);
        if (!status.success) throw new Error(JSON.stringify(status.error.format()));
        return { ...selection, status: status.data };
    }

    importCreateUsers(req) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

        let rawRows: any[] = [];

        if (file && file.buffer) {
            try {
                const workbook = XLSX.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName || !workbook.Sheets[sheetName]) {
                    throw new Error("No readable sheet found in uploaded file");
                }
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            } catch (err: any) {
                throw new Error(`Failed to parse Excel/CSV file: ${err.message}`);
            }
        } else if (Array.isArray(req.body?.users)) {
            rawRows = req.body.users;
        } else if (Array.isArray(req.body?.data)) {
            rawRows = req.body.data;
        } else if (Array.isArray(req.body)) {
            rawRows = req.body;
        } else {
            throw new Error("Excel or CSV file (user_detail.xlsx / user_detail.csv) is required");
        }

        if (rawRows.length === 0) {
            throw new Error("The uploaded file does not contain any data rows");
        }

        let options = {
            skip_duplicates: true,
            notify_users: false
        };

        if (req.body?.options) {
            if (typeof req.body.options === 'string') {
                try {
                    options = { ...options, ...JSON.parse(req.body.options) };
                } catch (_) {}
            } else if (typeof req.body.options === 'object') {
                options = { ...options, ...req.body.options };
            }
        }

        if (req.body?.skip_duplicates !== undefined) {
            options.skip_duplicates = String(req.body.skip_duplicates) === 'true' || req.body.skip_duplicates === true;
        }
        if (req.body?.notify_users !== undefined) {
            options.notify_users = String(req.body.notify_users) === 'true' || req.body.notify_users === true;
        }

        const normalizeKey = (key: string): string => {
            const k = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
            if (k === "firstname" || k === "first") return "first_name";
            if (k === "lastname" || k === "last") return "last_name";
            if (k === "email" || k === "emailaddress" || k === "mail") return "email";
            if (k === "status" || k === "userstatus") return "status";
            if (k === "password" || k === "passwordhash") return "password_hash";
            return key.trim().toLowerCase().replace(/\s+/g, "_");
        };

        const defaultPasswordHash = bcrypt.hashSync("Welcome@123", 10);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const validUsers: any[] = [];
        const invalidRows: any[] = [];
        const duplicates: any[] = [];
        const seenEmails = new Set<string>();

        rawRows.forEach((rawRow: any, index: number) => {
            const rowNumber = index + 2;
            const normalizedRow: any = {};

            Object.entries(rawRow).forEach(([k, v]) => {
                normalizedRow[normalizeKey(k)] = typeof v === 'string' ? v.trim() : v;
            });

            const email = normalizedRow.email ? String(normalizedRow.email).trim() : "";
            const firstName = normalizedRow.first_name ? String(normalizedRow.first_name).trim() : "";
            const lastName = normalizedRow.last_name ? String(normalizedRow.last_name).trim() : "";
            const rawStatus = normalizedRow.status ? String(normalizedRow.status).trim().toLowerCase() : "active";

            if (!email && !firstName && !lastName) {
                return;
            }

            if (!email) {
                invalidRows.push({ row: rowNumber, error: "Missing email address", data: rawRow });
                return;
            }

            if (!emailRegex.test(email)) {
                invalidRows.push({ row: rowNumber, email, error: "Invalid email format" });
                return;
            }

            if (!firstName) {
                invalidRows.push({ row: rowNumber, email, error: "Missing first name" });
                return;
            }

            const emailLower = email.toLowerCase();
            if (seenEmails.has(emailLower)) {
                if (options.skip_duplicates) {
                    duplicates.push({ row: rowNumber, email, reason: "Duplicate email in file" });
                    return;
                } else {
                    invalidRows.push({ row: rowNumber, email, error: "Duplicate email in import file" });
                    return;
                }
            }

            seenEmails.add(emailLower);

            const status = ['active', 'inactive', 'pending'].includes(rawStatus)
                ? rawStatus.toUpperCase()
                : 'ACTIVE';

            const passwordHash = normalizedRow.password_hash || normalizedRow.password || defaultPasswordHash;

            validUsers.push({
                rowNumber,
                first_name: firstName,
                last_name: lastName,
                email,
                password_hash: passwordHash,
                status
            });
        });

        if (!options.skip_duplicates && duplicates.length > 0) {
            throw new Error(`Duplicate emails found in file: ${duplicates.map(d => d.email).join(', ')}`);
        }

        if (validUsers.length === 0) {
            throw new Error("No valid user records found in file to import");
        }

        return {
            users: validUsers,
            options,
            duplicates,
            invalidRows
        };
    }

    importUpdateUsers(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

        let rawRows: any[] = [];

        if (file && file.buffer) {
            try {
                const workbook = XLSX.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName || !workbook.Sheets[sheetName]) {
                    throw new Error("No readable sheet found in uploaded file");
                }
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            } catch (err: any) {
                throw new Error(`Failed to parse Excel/CSV file: ${err.message}`);
            }
        } else if (Array.isArray(req.body?.users)) {
            rawRows = req.body.users;
        } else if (Array.isArray(req.body?.data)) {
            rawRows = req.body.data;
        } else if (Array.isArray(req.body)) {
            rawRows = req.body;
        } else {
            throw new Error("Excel or CSV file (user_detail.xlsx / user_detail.csv) is required");
        }

        if (rawRows.length === 0) {
            throw new Error("The uploaded file does not contain any data rows");
        }

        let options: any = {};
        if (req.body?.options) {
            if (typeof req.body.options === 'string') {
                try {
                    options = { ...JSON.parse(req.body.options) };
                } catch (_) {}
            } else if (typeof req.body.options === 'object') {
                options = { ...req.body.options };
            }
        }

        const normalizeKey = (key: string): string => {
            const k = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
            if (k === "firstname" || k === "first") return "first_name";
            if (k === "lastname" || k === "last") return "last_name";
            if (k === "email" || k === "emailaddress" || k === "mail") return "email";
            if (k === "status" || k === "userstatus") return "status";
            if (k === "password" || k === "passwordhash") return "password_hash";
            if (k === "id" || k === "userid") return "id";
            return key.trim().toLowerCase().replace(/\s+/g, "_");
        };

        let rawIdentifierKey = req.body?.identifier_key 
            || options?.identifier_key 
            || req.query?.identifier_key 
            || "email";

        const identifierKey = normalizeKey(String(rawIdentifierKey));

        const validUpdates: any[] = [];
        const invalidRows: any[] = [];

        rawRows.forEach((rawRow: any, index: number) => {
            const rowNumber = index + 2;
            const normalizedRow: any = {};

            Object.entries(rawRow).forEach(([k, v]) => {
                normalizedRow[normalizeKey(k)] = typeof v === 'string' ? v.trim() : v;
            });

            const idVal = normalizedRow[identifierKey] !== undefined ? String(normalizedRow[identifierKey]).trim() : "";

            if (!idVal) {
                invalidRows.push({
                    row: rowNumber,
                    error: `Missing identifier column '${identifierKey}'`,
                    data: rawRow
                });
                return;
            }

            const updateData: any = {};
            if (normalizedRow.first_name !== undefined && normalizedRow.first_name !== "") {
                updateData.first_name = String(normalizedRow.first_name).trim();
            }
            if (normalizedRow.last_name !== undefined && normalizedRow.last_name !== "") {
                updateData.last_name = String(normalizedRow.last_name).trim();
            }
            if (normalizedRow.status !== undefined && normalizedRow.status !== "") {
                const s = String(normalizedRow.status).trim().toLowerCase();
                updateData.status = ['active', 'inactive', 'pending'].includes(s)
                    ? s.toUpperCase()
                    : normalizedRow.status;
            }
            if (normalizedRow.password_hash !== undefined && normalizedRow.password_hash !== "") {
                updateData.password_hash = String(normalizedRow.password_hash).trim();
            } else if (normalizedRow.password !== undefined && normalizedRow.password !== "") {
                updateData.password_hash = bcrypt.hashSync(String(normalizedRow.password).trim(), 10);
            }

            if (identifierKey !== 'email' && normalizedRow.email !== undefined && normalizedRow.email !== "") {
                updateData.email = String(normalizedRow.email).trim();
            }

            if (Object.keys(updateData).length === 0) {
                invalidRows.push({
                    row: rowNumber,
                    [identifierKey]: idVal,
                    error: "No fields provided to update"
                });
                return;
            }

            validUpdates.push({
                rowNumber,
                identifierKey,
                identifierValue: idVal,
                data: updateData
            });
        });

        if (validUpdates.length === 0 && invalidRows.length > 0) {
            throw new Error(`Failed to process file: ${invalidRows[0].error}`);
        }

        return {
            updates: validUpdates,
            identifierKey,
            invalidRows,
            options
        };
    }

    aiSummary(req) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        return {
            selected_row_ids: Array.isArray(body.selected_row_ids) ? body.selected_row_ids.map(String) : [],
            selected_rows: Array.isArray(body.selected_rows) ? body.selected_rows : [],
            active_filters: (body.active_filters && typeof body.active_filters === 'object') ? body.active_filters : {},
            table_key: body.table_key || 'users_table_1234',
            context: (body.context && typeof body.context === 'object') ? body.context : {}
        };
    }

    aiInteract(req) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const query = typeof body.query === 'string' ? body.query.trim() : '';
        if (!query) {
            throw new Error("Query is required for AI interaction");
        }
        return {
            query,
            columns: Array.isArray(body.columns) ? body.columns : [],
            current_rows: Array.isArray(body.current_rows) ? body.current_rows : [],
            selected_row_ids: Array.isArray(body.selected_row_ids) ? body.selected_row_ids.map(String) : [],
            active_filters: (body.active_filters && typeof body.active_filters === 'object') ? body.active_filters : {},
            table_key: body.table_key || 'users_table_1234'
        };
    }
}
