import { z } from 'zod';

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
        let page = Number(req.query?.page || 1);
        let limit = Number(req.query?.limit || 25);

        const validator = z.object({
            page: z.coerce.number().int({ message: "invalid page id" }),
            limit: z.coerce.number().int({ message: "invalid page limit" })
        });

        const result = validator.safeParse({page:page, limit:limit });

        if (!result.success) {
            // Throw the Zod errors to be caught by the controller's try/catch block
            throw new Error(JSON.stringify(result.error.format()));
        }

        // 3. Extract data values into an array in a predictable order
        ({ page, limit } = result.data);

        return {page : page, limit : limit};

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
            password_hash: z.string().min(2, "Password must be at least 6 characters"),
            status: z.enum(["active", "inactive", "pending"]).default("active"),
        });
        const validator = z.array(userSchema);
        const result = validator.safeParse(req.body);

        if (!result.success) throw new Error(JSON.stringify(result.error.format()));

        return result.data.map(u => [u.first_name, u.last_name, u.email, u.password_hash, u.status.toUpperCase()]);
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
}
