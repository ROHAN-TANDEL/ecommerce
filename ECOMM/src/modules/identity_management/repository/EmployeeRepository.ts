import db from "../../../platformdb/facade.js";
import { QueryBuilder } from "../../../helpers/QueryBuilder.js";

export class EmployeeRepository {

    private readonly queryBuilder;

    constructor() {
        this.queryBuilder = new QueryBuilder();
    }

    async createEmployee(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO master.employees (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
            const result = await db.master.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.log({ error });
            if (error.code === "23505") throw new Error('employee already exists');
            throw error;
        }
    }

    async getEmployee(id: any) {
        try {
            const query = `SELECT * FROM master.employees WHERE id=$1 LIMIT 1`;
            const result = await db.master.query(query, [id]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async getemployees(limit: number, offset: number, inputs: any = {}) {
        try {
            const query = `SELECT * FROM master.employees ORDER BY id ASC LIMIT $1 OFFSET $2`;
            const result = await db.master.query(query, [limit, offset]);
            return result?.rows || [];
        } catch (error) {
            return [];
        }
    }

    async getTotalemployees(inputs: any = {}) {
        try {
            const query = `SELECT COUNT(*) as total FROM master.employees`;
            const result = await db.master.query(query);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            return 0;
        }
    }

    async updateEmployee(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
            const query = `UPDATE master.employees SET ${setClause} WHERE id=$1 RETURNING *`;
            const result = await db.master.query(query, [id, ...vals]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async deleteEmployee(id: any) {
        try {
            const query = `DELETE FROM master.employees WHERE id=$1 RETURNING id`;
            const result = await db.master.query(query, [id]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async createAllemployees(records: any[]) {
        const results = [];
        for (const rec of records) {
            const r = await this.createEmployee(rec);
            results.push(r);
        }
        return results;
    }

    async updateAllemployees(records: any[]) {
        const results = [];
        for (const rec of records) {
            const { id, ...data } = rec;
            const r = await this.updateEmployee(id, data);
            results.push(r);
        }
        return results;
    }

    async deleteAllemployees(ids: any[]) {
        try {
            const query = `DELETE FROM master.employees WHERE id = ANY($1::int[]) RETURNING id`;
            const result = await db.master.query(query, [ids]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async updateMatchingemployees(data: any, filters: any, excluded: any[]) {
        return { updated_count: 0 };
    }

    async deleteMatchingemployees(filters: any, excluded: any[]) {
        return { deleted_count: 0 };
    }

    async importemployees(records: any[], options: any = {}) {
        return { inserted_count: records.length };
    }

    async importUpdateemployees(updates: any[], options: any = {}) {
        return { updated: updates.length, not_found: 0, errors: [] };
    }
}
