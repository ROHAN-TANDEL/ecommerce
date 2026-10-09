import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, CustomerFilterConfig } from "../config/customer.filter.config.js";

export class CustomerRepository {

    constructor() {}

    async createCustomer(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.customers (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[CustomerRepository:createCustomer] Error:', error);
            if (error.code === "23505") throw new Error('customer already exists');
            throw error;
        }
    }

    async getCustomer(id: any) {
        try {
            const query = `SELECT * FROM master.customers WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[CustomerRepository:getCustomer] Error:', error);
            throw error;
        }
    }

    async getcustomers(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT * FROM master.customers WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += CustomerFilterConfig(filterInputs, inputValues);

            const validSortColumns = ['id', 'customer_code', 'customer_name', 'legal_name', 'status', 'customer_type', 'industry', 'risk_level', 'email', 'phone', 'website', 'owner_name', 'owner_email', 'country', 'country_code', 'city', 'state', 'postal_code', 'address', 'annual_revenue', 'currency', 'employee_count', 'onboarding_date', 'last_activity_at', 'is_active', 'editable', 'created_at', 'updated_at'];
            let sortClause = ' ORDER BY created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = ` ORDER BY ${col} ${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = ` ORDER BY ${inputs.sort} ASC`;
            }

            query += sortClause;
            query += ` LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const result = await db.master.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[CustomerRepository:getcustomers] Error:', error);
            return [];
        }
    }

    async getTotalcustomers(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT COUNT(*) as total FROM master.customers WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += CustomerFilterConfig(filterInputs, inputValues);

            const result = await db.master.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[CustomerRepository:getTotalcustomers] Error:', error);
            return 0;
        }
    }

    async updateCustomer(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const query = `UPDATE master.customers SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[CustomerRepository:updateCustomer] Error:', error);
            throw error;
        }
    }

    async deleteCustomer(id: any) {
        try {
            const query = `DELETE FROM master.customers WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[CustomerRepository:deleteCustomer] Error:', error);
            throw error;
        }
    }

    async createBulkcustomers(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.createCustomer(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulkcustomers(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.updateCustomer(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAllcustomers(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const query = `UPDATE master.customers SET ${setClause}, updated_at = NOW() WHERE id = ANY($${keys.length + 1}) RETURNING id`;
            const result = await db.master.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[CustomerRepository:updateAllcustomers] Error:', error);
            throw error;
        }
    }

    async deleteAllcustomers(ids: any[]) {
        try {
            const query = `DELETE FROM master.customers WHERE id = ANY($1) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[CustomerRepository:deleteAllcustomers] Error:', error);
            throw error;
        }
    }

    async importcustomers(records: any[], _options: any = {}) {
        return await this.createBulkcustomers(records);
    }

    async importUpdatecustomers(updates: any[], _options: any = {}) {
        return await this.updateBulkcustomers(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = 'customers_table_1234', userId = null) {
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
            console.error('[CustomerRepository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = 'customers_table_1234', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
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
            console.error('[CustomerRepository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = `SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[CustomerRepository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = `DELETE FROM master.table_views WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[CustomerRepository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'customers_table_1234', _userId: any = null) {
        try {
            await db.master.query(`UPDATE master.table_views SET is_default = false WHERE table_key = $1`, [tableKey]);
            const result = await db.master.query(`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[CustomerRepository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
