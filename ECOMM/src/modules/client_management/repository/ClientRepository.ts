import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, ClientFilterConfig } from "../config/client.filter.config.js";

export class ClientRepository {

    constructor() {}

    async createClient(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.clients (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[ClientRepository:createClient] Error:', error);
            if (error.code === "23505") throw new Error('client already exists');
            throw error;
        }
    }

    async getClient(id: any) {
        try {
            const query = `SELECT master.clients.*, rel_1_partners.name AS partner_name, COUNT(DISTINCT rel_2_client_users.id)::int AS user_count, COUNT(DISTINCT rel_3_client_products.id)::int AS product_count FROM master.clients LEFT JOIN master.partners rel_1_partners ON rel_1_partners.id = master.clients.partner_id LEFT JOIN master.client_users rel_2_client_users ON rel_2_client_users.client_id = master.clients.id LEFT JOIN master.client_products rel_3_client_products ON rel_3_client_products.client_id = master.clients.id WHERE master.clients.id = $1 GROUP BY master.clients.id LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientRepository:getClient] Error:', error);
            throw error;
        }
    }

    async getClients(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT master.clients.*, rel_1_partners.name AS partner_name, COUNT(DISTINCT rel_2_client_users.id)::int AS user_count, COUNT(DISTINCT rel_3_client_products.id)::int AS product_count FROM master.clients LEFT JOIN master.partners rel_1_partners ON rel_1_partners.id = master.clients.partner_id LEFT JOIN master.client_users rel_2_client_users ON rel_2_client_users.client_id = master.clients.id LEFT JOIN master.client_products rel_3_client_products ON rel_3_client_products.client_id = master.clients.id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ClientFilterConfig(filterInputs, inputValues);
            query += ` GROUP BY master.clients.id`;

            const validSortColumns = ['id', 'partner_name', 'partner_id', 'client_code', 'client_name', 'domain', 'industry', 'status', 'user_count', 'product_count', 'contact_person_name', 'email', 'max_users', 'created_at'];
            let sortClause = ' ORDER BY master.clients.created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = ` ORDER BY master.clients.${col} ${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = ` ORDER BY master.clients.${inputs.sort} ASC`;
            }

            query += sortClause;
            query += ` LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const result = await db.master.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientRepository:getClients] Error:', error);
            return [];
        }
    }

    async getTotalClients(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT COUNT(DISTINCT master.clients.id) as total FROM master.clients LEFT JOIN master.partners rel_1_partners ON rel_1_partners.id = master.clients.partner_id LEFT JOIN master.client_users rel_2_client_users ON rel_2_client_users.client_id = master.clients.id LEFT JOIN master.client_products rel_3_client_products ON rel_3_client_products.client_id = master.clients.id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ClientFilterConfig(filterInputs, inputValues);

            const result = await db.master.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[ClientRepository:getTotalClients] Error:', error);
            return 0;
        }
    }

    async getClientsByPartnerId(foreignId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT master.clients.*, rel_1_partners.name AS partner_name FROM master.clients LEFT JOIN master.partners rel_1_partners ON rel_1_partners.id = master.clients.partner_id WHERE master.clients.partner_id = $1 ORDER BY master.clients.created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [foreignId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientRepository:getClientsByPartnerId] Error:', error);
            return [];
        }
    }

    async getClientUsersByClientId(parentId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT * FROM master.client_users WHERE client_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [parentId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientRepository:getClientUsersByClientId] Error:', error);
            return [];
        }
    }

    async getClientProductsByClientId(parentId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT * FROM master.client_products WHERE client_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [parentId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientRepository:getClientProductsByClientId] Error:', error);
            return [];
        }
    }


    async updateClient(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const query = `UPDATE master.clients SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientRepository:updateClient] Error:', error);
            throw error;
        }
    }

    async deleteClient(id: any) {
        try {
            const query = `DELETE FROM master.clients WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientRepository:deleteClient] Error:', error);
            throw error;
        }
    }

    async createBulkClients(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.createClient(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulkClients(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.updateClient(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAllClients(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const query = `UPDATE master.clients SET ${setClause}, updated_at = NOW() WHERE id = ANY($${keys.length + 1}) RETURNING id`;
            const result = await db.master.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[ClientRepository:updateAllClients] Error:', error);
            throw error;
        }
    }

    async deleteAllClients(ids: any[]) {
        try {
            const query = `DELETE FROM master.clients WHERE id = ANY($1) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[ClientRepository:deleteAllClients] Error:', error);
            throw error;
        }
    }

    async importClients(records: any[], _options: any = {}) {
        return await this.createBulkClients(records);
    }

    async importUpdateClients(updates: any[], _options: any = {}) {
        return await this.updateBulkClients(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = 'clients_table_5002', userId = null) {
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
            console.error('[ClientRepository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = 'clients_table_5002', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
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
            console.error('[ClientRepository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = `SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientRepository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = `DELETE FROM master.table_views WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientRepository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'clients_table_5002', _userId: any = null) {
        try {
            await db.master.query(`UPDATE master.table_views SET is_default = false WHERE table_key = $1`, [tableKey]);
            const result = await db.master.query(`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientRepository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
