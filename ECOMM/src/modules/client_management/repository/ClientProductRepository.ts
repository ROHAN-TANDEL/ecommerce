import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, ClientProductFilterConfig } from "../config/client_product.filter.config.js";

export class ClientProductRepository {

    constructor() {}

    async createClientProduct(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.client_products (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[ClientProductRepository:createClientProduct] Error:', error);
            if (error.code === "23505") throw new Error('clientproduct already exists');
            throw error;
        }
    }

    async getClientProduct(id: any) {
        try {
            const query = `SELECT master.client_products.*, rel_1_clients.client_name AS client_name, rel_2_products.name AS product_name FROM master.client_products LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_products.client_id LEFT JOIN master.products rel_2_products ON rel_2_products.id = master.client_products.product_id WHERE master.client_products.id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientProductRepository:getClientProduct] Error:', error);
            throw error;
        }
    }

    async getClientproducts(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT master.client_products.*, rel_1_clients.client_name AS client_name, rel_2_products.name AS product_name FROM master.client_products LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_products.client_id LEFT JOIN master.products rel_2_products ON rel_2_products.id = master.client_products.product_id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ClientProductFilterConfig(filterInputs, inputValues);
            query += ``;

            const validSortColumns = ['id', 'client_name', 'client_id', 'product_name', 'product_id', 'license_type', 'status', 'max_seats', 'allocated_seats', 'external_tenant_id', 'effective_launch_url', 'valid_to'];
            let sortClause = ' ORDER BY master.client_products.created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = ` ORDER BY master.client_products.${col} ${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = ` ORDER BY master.client_products.${inputs.sort} ASC`;
            }

            query += sortClause;
            query += ` LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const result = await db.master.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientProductRepository:getClientproducts] Error:', error);
            return [];
        }
    }

    async getTotalClientproducts(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT COUNT(DISTINCT master.client_products.id) as total FROM master.client_products LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_products.client_id LEFT JOIN master.products rel_2_products ON rel_2_products.id = master.client_products.product_id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ClientProductFilterConfig(filterInputs, inputValues);

            const result = await db.master.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[ClientProductRepository:getTotalClientproducts] Error:', error);
            return 0;
        }
    }

    async getClientproductsByClientId(foreignId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT master.client_products.*, rel_1_clients.client_name AS client_name FROM master.client_products LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_products.client_id WHERE master.client_products.client_id = $1 ORDER BY master.client_products.created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [foreignId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientProductRepository:getClientproductsByClientId] Error:', error);
            return [];
        }
    }

    async getClientproductsByProductId(foreignId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT master.client_products.*, rel_1_clients.client_name AS client_name, rel_2_products.name AS product_name FROM master.client_products LEFT JOIN master.clients rel_1_clients ON rel_1_clients.id = master.client_products.client_id LEFT JOIN master.products rel_2_products ON rel_2_products.id = master.client_products.product_id WHERE master.client_products.product_id = $1 ORDER BY master.client_products.created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [foreignId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ClientProductRepository:getClientproductsByProductId] Error:', error);
            return [];
        }
    }


    async updateClientProduct(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const query = `UPDATE master.client_products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientProductRepository:updateClientProduct] Error:', error);
            throw error;
        }
    }

    async deleteClientProduct(id: any) {
        try {
            const query = `DELETE FROM master.client_products WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientProductRepository:deleteClientProduct] Error:', error);
            throw error;
        }
    }

    async createBulkClientproducts(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.createClientProduct(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulkClientproducts(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.updateClientProduct(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAllClientproducts(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const query = `UPDATE master.client_products SET ${setClause}, updated_at = NOW() WHERE id = ANY($${keys.length + 1}) RETURNING id`;
            const result = await db.master.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[ClientProductRepository:updateAllClientproducts] Error:', error);
            throw error;
        }
    }

    async deleteAllClientproducts(ids: any[]) {
        try {
            const query = `DELETE FROM master.client_products WHERE id = ANY($1) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[ClientProductRepository:deleteAllClientproducts] Error:', error);
            throw error;
        }
    }

    async importClientproducts(records: any[], _options: any = {}) {
        return await this.createBulkClientproducts(records);
    }

    async importUpdateClientproducts(updates: any[], _options: any = {}) {
        return await this.updateBulkClientproducts(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = 'client_products_table_5004', userId = null) {
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
            console.error('[ClientProductRepository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = 'client_products_table_5004', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
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
            console.error('[ClientProductRepository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = `SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientProductRepository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = `DELETE FROM master.table_views WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientProductRepository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'client_products_table_5004', _userId: any = null) {
        try {
            await db.master.query(`UPDATE master.table_views SET is_default = false WHERE table_key = $1`, [tableKey]);
            const result = await db.master.query(`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ClientProductRepository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
