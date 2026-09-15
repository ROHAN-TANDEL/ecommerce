import db from "../../../platformdb/facade.js";

export class ProductRepository {

    async createProduct(input:any)
    {
        const sql = ` INSERT INTO products ( name, identifier, description, status )
                      VALUES ( $1, $2, $3, 'active' ) RETURNING * `;
        return await db.master.query( sql, [ input.name, input.identifier, input.description ] );
    }
}