import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, ClientUserFilterConfig } from "../config/client_user.filter.config.js";

export class ClientUserRepository {

    constructor() {}

    async createClientUser(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.client_users (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[ClientUserRepository:createClientUser] Error:', error);
            if (error.code === "23505") throw new Error('clientuser already exists');
            throw error;
        }
    }

    async getClientUser(id: any) {
        try {
            const query = `SELECT master.client_users.*, rel_1_clients.client_name AS client_name FROM master.client_users LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_users.client_id WHERE master.client_users.id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientUserRepository:getClientUser] Error:', error);
            throw error;
        }
    }

    async getClientusers(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT master.client_users.*, rel_1_clients.client_name AS client_name FROM master.client_users LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_users.client_id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ClientUserFilterConfig(filterInputs, inputValues);
            query += ``;

            const validSortColumns = ['id', 'client_name', 'client_id', 'first_name', 'last_name', 'email', 'role', 'job_title', 'status', 'is_primary_contact', 'created_at'];
            let sortClause = ' ORDER BY master.client_users.created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = ` ORDER BY master.client_users.${col} ${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = ` ORDER BY master.client_users.${inputs.sort} ASC`;
            }

            query += sortClause;
            query += ` LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const result = await db.master.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientUserRepository:getClientusers] Error:', error);
            return [];
        }
    }

    async getTotalClientusers(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT COUNT(DISTINCT master.client_users.id) as total FROM master.client_users LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_users.client_id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ClientUserFilterConfig(filterInputs, inputValues);

            const result = await db.master.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[ClientUserRepository:getTotalClientusers] Error:', error);
            return 0;
        }
    }

    async getClientusersByClientId(foreignId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT master.client_users.*, rel_1_clients.client_name AS client_name FROM master.client_users LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_users.client_id WHERE master.client_users.client_id = $1 ORDER BY master.client_users.created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [foreignId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientUserRepository:getClientusersByClientId] Error:', error);
            return [];
        }
    }


    async updateClientUser(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const query = `UPDATE master.client_users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientUserRepository:updateClientUser] Error:', error);
            throw error;
        }
    }

    async deleteClientUser(id: any) {
        try {
            const query = `DELETE FROM master.client_users WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientUserRepository:deleteClientUser] Error:', error);
            throw error;
        }
    }

    async createBulkClientusers(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.createClientUser(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulkClientusers(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.updateClientUser(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAllClientusers(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const query = `UPDATE master.client_users SET ${setClause}, updated_at = NOW() WHERE id = ANY($${keys.length + 1}) RETURNING id`;
            const result = await db.master.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[ClientUserRepository:updateAllClientusers] Error:', error);
            throw error;
        }
    }

    async deleteAllClientusers(ids: any[]) {
        try {
            const query = `DELETE FROM master.client_users WHERE id = ANY($1) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[ClientUserRepository:deleteAllClientusers] Error:', error);
            throw error;
        }
    }

    async importClientusers(records: any[], _options: any = {}) {
        return await this.createBulkClientusers(records);
    }

    async importUpdateClientusers(updates: any[], _options: any = {}) {
        return await this.updateBulkClientusers(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = 'client_users_table_5005', userId = null) {
        try {
            let query = `SELECT * FROM master.table_views WHERE table_key = $1`;
            const params: any[] = [tableKey];
            if (userId) {
                query += ` AND (user_id = $2 OR is_shared = true OR user_id IS NULL)`;
                params.push(userId);
            }
            const result = await db.master.query(query, params);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientUserRepository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = 'client_users_table_5005', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
            if (id) {
                const query = `
                    UPDATE master.table_views
                    SET name = $2, description = $3, is_default = $4, is_shared = $5, is_locked = $6, view_state = $7, updated_at = NOW()
                    WHERE id = $1 RETURNING *
                `;
                const result = await db.master.query(query, [id, name, description, is_default, is_shared, is_locked, JSON.stringify(view_state)]);
                return result?.rows?.[0];
            } else {
                const query = `
                    INSERT INTO master.table_views (name, table_key, user_id, description, is_default, is_shared, is_locked, view_state)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
                `;
                const result = await db.master.query(query, [name, table_key, user_id, description, is_default, is_shared, is_locked, JSON.stringify(view_state)]);
                return result?.rows?.[0];
            }
        } catch (error) {
            console.error('[ClientUserRepository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = `SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientUserRepository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = `DELETE FROM master.table_views WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientUserRepository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'client_users_table_5005', _userId: any = null) {
        try {
            await db.master.query(`UPDATE master.table_views SET is_default = false WHERE table_key = $1`, [tableKey]);
            const result = await db.master.query(`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientUserRepository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
