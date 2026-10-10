import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, ProductFilterConfig } from "../config/product.filter.config.js";

export class ProductRepository {

    constructor() {}

    async createProduct(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.products (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[ProductRepository:createProduct] Error:', error);
            if (error.code === "23505") throw new Error('product already exists');
            throw error;
        }
    }

    async getProduct(id: any) {
        try {
            const query = `SELECT master.products.*, COUNT(DISTINCT rel_1_client_products.id)::int AS subscribed_clients_count FROM master.products LEFT JOIN master.client_products rel_1_client_products ON rel_1_client_products.product_id = master.products.id WHERE master.products.id = $1 GROUP BY master.products.id LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ProductRepository:getProduct] Error:', error);
            throw error;
        }
    }

    async getProducts(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT master.products.*, COUNT(DISTINCT rel_1_client_products.id)::int AS subscribed_clients_count FROM master.products LEFT JOIN master.client_products rel_1_client_products ON rel_1_client_products.product_id = master.products.id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ProductFilterConfig(filterInputs, inputValues);
            query += ` GROUP BY master.products.id`;

            const validSortColumns = ['id', 'product_code', 'name', 'category', 'status', 'version', 'external_launch_url', 'sso_client_id', 'subscribed_clients_count', 'created_at'];
            let sortClause = ' ORDER BY master.products.created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = ` ORDER BY master.products.${col} ${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = ` ORDER BY master.products.${inputs.sort} ASC`;
            }

            query += sortClause;
            query += ` LIMIT $${inputValues.length + 1} OFFSET $${inputValues.length + 2}`;
            inputValues.push(limit, offset);

            const result = await db.master.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[ProductRepository:getProducts] Error:', error);
            return [];
        }
    }

    async getTotalProducts(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = `SELECT COUNT(DISTINCT master.products.id) as total FROM master.products LEFT JOIN master.client_products rel_1_client_products ON rel_1_client_products.product_id = master.products.id WHERE 1=1`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ProductFilterConfig(filterInputs, inputValues);

            const result = await db.master.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[ProductRepository:getTotalProducts] Error:', error);
            return 0;
        }
    }

    async getClientProductsByProductId(parentId: any, limit: number = 25, offset: number = 0) {
        try {
            const query = `SELECT * FROM master.client_products WHERE product_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
            const result = await db.master.query(query, [parentId, limit, offset]);
            return result?.rows || [];
        } catch (error) {
            console.error('[ProductRepository:getClientProductsByProductId] Error:', error);
            return [];
        }
    }


    async updateProduct(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const query = `UPDATE master.products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ProductRepository:updateProduct] Error:', error);
            throw error;
        }
    }

    async deleteProduct(id: any) {
        try {
            const query = `DELETE FROM master.products WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ProductRepository:deleteProduct] Error:', error);
            throw error;
        }
    }

    async createBulkProducts(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.createProduct(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulkProducts(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.updateProduct(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAllProducts(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const query = `UPDATE master.products SET ${setClause}, updated_at = NOW() WHERE id = ANY($${keys.length + 1}) RETURNING id`;
            const result = await db.master.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[ProductRepository:updateAllProducts] Error:', error);
            throw error;
        }
    }

    async deleteAllProducts(ids: any[]) {
        try {
            const query = `DELETE FROM master.products WHERE id = ANY($1) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[ProductRepository:deleteAllProducts] Error:', error);
            throw error;
        }
    }

    async importProducts(records: any[], _options: any = {}) {
        return await this.createBulkProducts(records);
    }

    async importUpdateProducts(updates: any[], _options: any = {}) {
        return await this.updateBulkProducts(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = 'products_table_5003', userId = null) {
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
            console.error('[ProductRepository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = 'products_table_5003', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
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
            console.error('[ProductRepository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = `SELECT * FROM master.table_views WHERE id = $1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ProductRepository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = `DELETE FROM master.table_views WHERE id = $1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ProductRepository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = 'products_table_5003', _userId: any = null) {
        try {
            await db.master.query(`UPDATE master.table_views SET is_default = false WHERE table_key = $1`, [tableKey]);
            const result = await db.master.query(`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[ProductRepository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
