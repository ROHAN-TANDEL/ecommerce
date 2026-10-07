import db from "../../../platformdb/facade.js";
import { QueryBuilder } from "../../../helpers/QueryBuilder.js";
import { MasterFilterConfig, UserFilterConfig } from "../config/user.filter.config.js";


export class UserRepository {

    private readonly queryBuilder;

    constructor()
    {
        this.queryBuilder = new QueryBuilder();
    }

    async createUser(inputs)
    {
        try {
            const query = `INSERT INTO master.users (
                                              first_name,
                                              last_name,
                                              email,
                                              password_hash,
                                              status)
                           VALUES ($1, $2, $3, $4, $5) RETURNING id`;

            const result = await db.master.query(query, inputs);

            return result?.rows;
        }
        catch (error) {

            console.log({error:error});

            if (error.code === "23505") {
                throw new Error('user already exists');
            }

            throw error;
        }
    }

    async getUser(inputs)
    {
        try {
            const query = `select * from master.users where id=$1 limit 1`;

            const result = await db.master.query(query, inputs);

            return result?.rows;
        }
        catch (error) {
            throw error;
        }
    }

    async getUsers(limit, offset, inputs: any = {})
    {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT * FROM users WHERE 1=1`;
            query = query + MasterFilterConfig(filterInputs);
            query = query + UserFilterConfig(filterInputs);

            const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'status', 'created_at', 'updated_at'];
            const sortCol = validSortColumns.includes(inputs?.sort) ? inputs.sort : 'created_at';
            const sortOrder = String(inputs?.order || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            query += ` ORDER BY ${sortCol} ${sortOrder} LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const users = await db.master.query(query, inputValues);
            return users?.rows;
        }
        catch (error) {
            throw error;
        }
    }

    async getTotalUsers(inputs: any = {})
    {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let countQuery = `SELECT COUNT(*)::int AS total FROM users WHERE 1=1`;
            countQuery = countQuery + MasterFilterConfig(filterInputs);
            countQuery = countQuery + UserFilterConfig(filterInputs);

            const countResult = await db.master.query(countQuery, inputValues);

            if (countResult?.rows && countResult.rows.length > 0 && countResult.rows[0]?.total !== undefined) {
                return countResult.rows[0].total;
            }
            return 0;
        }
        catch (errors) {
            throw errors;
        }
    }

    async updateUser(userId, inputs)
    {
        try {
            // 1. Generate the SQL string pieces using your helper
            const clauseInfo = this.queryBuilder.binding(inputs);

            // If the service sent an empty object (no fields to update)
            if (!clauseInfo) {
                throw new Error("fields not provided for update");
            }

            const { setClause, values, nextIndex } = clauseInfo;

            // 2. Construct the specific table query
            const query = `
                    UPDATE users 
                    SET ${setClause} 
                    WHERE id = $${nextIndex}
                    RETURNING id, first_name, last_name, email, status;
                `;

            // 3. Execute query with the parameters ordered predictably
            const result = await db.master.query(query, [...values, userId]);

            if (result.rowCount === 0) {
                throw new Error("invalid user");
            }
            return result.rows;
        }
        catch (errors) {
            throw errors;
        }
    }

    async deleteUser(inputs)
    {
        const query = `
            UPDATE users 
            SET 
                deleted_at = NOW(),
                status = 'INACTIVE'
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id, first_name, last_name, email, deleted_at;
        `;

        try {
            const result = await db.master.query(query, inputs);

            if (result.rowCount === 0) {
                throw new Error("user delete failed");
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async updateUserStatus()
    {
        const query = `
            UPDATE users 
            SET status = 'INACTIVE'
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id, first_name, last_name, email, deleted_at;
        `;

        try {
            const result = await db.master.query(query, inputs);

            if (result.rowCount === 0) {
                throw new Error("user delete failed");
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }


    async createBulkUsers(users) {
        try {
            if (!users || users.length === 0) return [];
            let query = 'INSERT INTO master.users (first_name, last_name, email, password_hash, status) VALUES ';
            const values = [];
            const valueStrings = [];
            let i = 1;
            users.forEach(user => {
                valueStrings.push(`(${i++}, ${i++}, ${i++}, ${i++}, ${i++})`);
                values.push(...user);
            });
            query += valueStrings.join(', ') + ' RETURNING id';
            const result = await db.master.query(query, values);
            return result?.rows;
        } catch (error) {
            console.log({error});
            throw error;
        }
    }

    async updateBulkUsers(updates) {
        try {
            const results = [];
            for (const update of updates) {
                const res = await this.updateUser(update.id, update.data);
                results.push(res);
            }
            return results;
        } catch (error) {
            console.log({error});
            throw error;
        }
    }

    async updateAllUsers(ids, data) {
        try {
            const clauseInfo = this.queryBuilder.binding(data);
            if (!clauseInfo) throw new Error("fields not provided for update");
            const { setClause, values, nextIndex } = clauseInfo;
            const query = `UPDATE users SET ${setClause} WHERE id = ANY($${nextIndex}) RETURNING id, first_name, last_name, email, status;`;
            const result = await db.master.query(query, [...values, ids]);
            return result.rows;
        } catch (error) {
            console.log({error});
            throw error;
        }
    }

    async updateMatchingUsers(data, filters, excluded) {
        const clauseInfo = this.queryBuilder.binding(data);
        if (!clauseInfo) throw new Error("fields not provided for update");

        const allowedFilterKeys = new Set(['first_name', 'last_name', 'email', 'status']);
        const where = ['deleted_at IS NULL'];
        const values = [...clauseInfo.values];
        let parameterIndex = clauseInfo.nextIndex;

        for (const [key, rawFilter] of Object.entries(filters ?? {})) {
            if (!allowedFilterKeys.has(key)) continue;
            const filterValue = rawFilter && typeof rawFilter === 'object' && !Array.isArray(rawFilter)
                ? (rawFilter as Record<string, any>).filter_value ?? (rawFilter as Record<string, any>).value
                : rawFilter;
            const filterValues = (Array.isArray(filterValue) ? filterValue : [filterValue])
                .filter(value => value !== null && value !== undefined && value !== '');
            if (filterValues.length === 0) continue;
            where.push(`"${key}"::text = ANY($${parameterIndex++})`);
            values.push(filterValues.map(String));
        }

        if (excluded?.length) {
            where.push(`id <> ALL($${parameterIndex++})`);
            values.push(excluded);
        }

        const query = `UPDATE users SET ${clauseInfo.setClause} WHERE ${where.join(' AND ')} RETURNING id, first_name, last_name, email, status;`;
        const result = await db.master.query(query, values);
        return result.rows;
    }

    async deleteMatchingUsers(filters, excluded) {
        const allowedFilterKeys = new Set(['first_name', 'last_name', 'email', 'status']);
        const where = ['deleted_at IS NULL'];
        const values = [];
        let parameterIndex = 1;

        for (const [key, rawFilter] of Object.entries(filters ?? {})) {
            if (!allowedFilterKeys.has(key)) continue;
            const filterValue = rawFilter && typeof rawFilter === 'object' && !Array.isArray(rawFilter)
                ? (rawFilter as Record<string, any>).filter_value ?? (rawFilter as Record<string, any>).value
                : rawFilter;
            const filterValues = (Array.isArray(filterValue) ? filterValue : [filterValue])
                .filter(value => value !== null && value !== undefined && value !== '');
            if (filterValues.length === 0) continue;
            where.push(`"${key}"::text = ANY($${parameterIndex++})`);
            values.push(filterValues.map(String));
        }

        if (excluded?.length) {
            where.push(`id <> ALL($${parameterIndex++})`);
            values.push(excluded);
        }

        const query = `UPDATE users SET deleted_at = NOW(), status = 'INACTIVE' WHERE ${where.join(' AND ')} RETURNING id, first_name, last_name, email, status;`;
        const result = await db.master.query(query, values);
        return result.rows;
    }

    async deleteAllUsers(ids) {
        try {
            const query = `UPDATE users SET deleted_at = NOW(), status = 'INACTIVE' WHERE id = ANY($1) AND deleted_at IS NULL RETURNING id, first_name, last_name, email, deleted_at;`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.log({error});
            throw error;
        }
    }

    importUsers() {}

    async getViews(tableKey = 'users_table_1234', userId = null) {
        try {
            let query = `
                SELECT id, table_key, user_id, name, description, is_default, is_shared, is_locked, view_state, created_at, updated_at
                FROM master.table_views
                WHERE table_key = $1
            `;
            const params: any[] = [tableKey];

            if (userId) {
                query += ` AND (user_id = $2 OR is_shared = true OR user_id IS NULL)`;
                params.push(userId);
            }

            query += ` ORDER BY is_default DESC, created_at DESC;`;
            const result = await db.master.query(query, params);
            return result?.rows || [];
        } catch (error) {
            console.log({ error: error });
            throw error;
        }
    }

    async saveView(data: any) {
        try {
            const {
                id,
                table_key = 'users_table_1234',
                user_id = null,
                name,
                description = null,
                is_default = false,
                is_shared = false,
                is_locked = false,
                view_state = {}
            } = data;

            if (is_default) {
                if (user_id) {
                    await db.master.query(
                        `UPDATE master.table_views SET is_default = false WHERE table_key = $1 AND user_id = $2`,
                        [table_key, user_id]
                    );
                } else {
                    await db.master.query(
                        `UPDATE master.table_views SET is_default = false WHERE table_key = $1`,
                        [table_key]
                    );
                }
            }

            if (id) {
                const updateQuery = `
                    UPDATE master.table_views
                    SET name = $1, description = $2, is_default = $3, is_shared = $4, is_locked = $5, view_state = $6, updated_at = NOW()
                    WHERE id = $7
                    RETURNING *;
                `;
                const result = await db.master.query(updateQuery, [
                    name,
                    description,
                    is_default,
                    is_shared,
                    is_locked,
                    typeof view_state === 'string' ? view_state : JSON.stringify(view_state),
                    id
                ]);
                return result?.rows?.[0];
            }

            const insertQuery = `
                INSERT INTO master.table_views (table_key, user_id, name, description, is_default, is_shared, is_locked, view_state, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                ON CONFLICT (user_id, table_key, name)
                DO UPDATE SET
                    view_state = EXCLUDED.view_state,
                    description = EXCLUDED.description,
                    is_default = EXCLUDED.is_default,
                    is_shared = EXCLUDED.is_shared,
                    updated_at = NOW()
                RETURNING *;
            `;
            const result = await db.master.query(insertQuery, [
                table_key,
                user_id,
                name,
                description,
                is_default,
                is_shared,
                is_locked,
                typeof view_state === 'string' ? view_state : JSON.stringify(view_state)
            ]);
            return result?.rows?.[0];
        } catch (error) {
            console.log({ error: error });
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const result = await db.master.query(`SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.log({ error });
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const result = await db.master.query(`DELETE FROM master.table_views WHERE id = $1 RETURNING id`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.log({ error });
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'users_table_1234', userId = null) {
        try {
            if (userId) {
                await db.master.query(
                    `UPDATE master.table_views SET is_default = false WHERE table_key = $1 AND user_id = $2`,
                    [tableKey, userId]
                );
            } else {
                await db.master.query(
                    `UPDATE master.table_views SET is_default = false WHERE table_key = $1`,
                    [tableKey]
                );
            }

            const result = await db.master.query(
                `UPDATE master.table_views SET is_default = true, updated_at = NOW() WHERE id = $1 RETURNING *;`,
                [id]
            );
            return result?.rows?.[0] || null;
        } catch (error) {
            console.log({ error });
            throw error;
        }
    }
}
