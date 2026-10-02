import db from "../../../platformdb/facade.js";
import { QueryBuilder } from "../../../helpers/QueryBuilder.js";


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

    async getUsers(limit, offset)
    {
        try {
            const users = await db.master.query(`
                      SELECT * FROM users
                      ORDER BY created_at DESC
                      LIMIT $1
                      OFFSET $2
                `, [limit, offset]);
            return users?.rows;
        }
        catch (error) {
            throw error;
        }
    }

    async getTotalUsers()
    {
        try {
            const countResult = await db.master.query(`SELECT COUNT(*)::int AS total FROM users`);

            if (countResult?.rows && countResult.rows.length > 0 && countResult.rows[0]?.total) {
                return countResult.rows[0].total;
            }
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

    importUsers() {}
}