import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, PartnerFilterConfig } from "../config/partner.filter.config.js";

export class PartnerRepository {

    constructor() {}

    async createPartner(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.partners (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[PartnerRepository:createPartner] Error:', error);
            if (error.code === "23505") throw new Error('partner already exists');
            throw error;
        }
    }

    async getPartner(id: any) {
        try {
            const query = `SELECT master.partners.*, COUNT(DISTINCT rel_1_clients.id)::int AS client_count FROM master.partners LEFT JOIN master.clients rel_1_clients ON rel_1_clients.partner_id = master.partners.id WHERE master.partners.id = $1 GROUP BY master.partners.id LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[PartnerRepository:getPartner] Error:', error);
            throw error;
        }
    }

    async getPartners(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT master.partners.*, COUNT(DISTINCT rel_1_clients.id)::int AS client_count FROM master.partners LEFT JOIN master.clients rel_1_clients ON rel_1_clients.partner_id = master.partners.id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += PartnerFilterConfig(filterInputs, inputValues);
            query += ` GROUP BY master.partners.id`;

            const validSortColumns = ['id', 'partner_code', 'name', 'partner_tier', 'status', 'client_count', 'email', 'phone', 'contact_person_name', 'billing_currency', 'commission_rate', 'country', 'created_at'];
            let sortClause = ' ORDER BY master.partners.created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = ` ORDER BY master.partners.${col} ${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = ` ORDER BY master.partners.${inputs.sort} ASC`;
            }

            query += sortClause;
            query += ` LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const result = await db.master.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[PartnerRepository:getPartners] Error:', error);
            return [];
        }
    }

    async getTotalPartners(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT COUNT(DISTINCT master.partners.id) as total FROM master.partners LEFT JOIN master.clients rel_1_clients ON rel_1_clients.partner_id = master.partners.id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += PartnerFilterConfig(filterInputs, inputValues);

            const result = await db.master.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[PartnerRepository:getTotalPartners] Error:', error);
            return 0;
        }
    }

    async getClientsByPartnerId(parentId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT * FROM master.clients WHERE partner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [parentId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[PartnerRepository:getClientsByPartnerId] Error:', error);
            return [];
        }
    }


    async updatePartner(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const query = `UPDATE master.partners SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[PartnerRepository:updatePartner] Error:', error);
            throw error;
        }
    }

    async deletePartner(id: any) {
        try {
            const query = `DELETE FROM master.partners WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[PartnerRepository:deletePartner] Error:', error);
            throw error;
        }
    }

    async createBulkPartners(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.createPartner(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulkPartners(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.updatePartner(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAllPartners(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const query = `UPDATE master.partners SET ${setClause}, updated_at = NOW() WHERE id = ANY($${keys.length + 1}) RETURNING id`;
            const result = await db.master.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[PartnerRepository:updateAllPartners] Error:', error);
            throw error;
        }
    }

    async deleteAllPartners(ids: any[]) {
        try {
            const query = `DELETE FROM master.partners WHERE id = ANY($1) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[PartnerRepository:deleteAllPartners] Error:', error);
            throw error;
        }
    }

    async importPartners(records: any[], _options: any = {}) {
        return await this.createBulkPartners(records);
    }

    async importUpdatePartners(updates: any[], _options: any = {}) {
        return await this.updateBulkPartners(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = 'partners_table_5001', userId = null) {
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
            console.error('[PartnerRepository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = 'partners_table_5001', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
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
            console.error('[PartnerRepository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = `SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[PartnerRepository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = `DELETE FROM master.table_views WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[PartnerRepository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'partners_table_5001', _userId: any = null) {
        try {
            await db.master.query(`UPDATE master.table_views SET is_default = false WHERE table_key = $1`, [tableKey]);
            const result = await db.master.query(`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[PartnerRepository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
