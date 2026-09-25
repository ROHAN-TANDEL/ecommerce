import db from "../../../platformdb/facade.js";

export class ClientRepository {

    async createClient(input:any)
    {
        return await db.master.query(
            `
                INSERT INTO clients
                (
                    business_id,
                    product_id,
                    client_code,
                    status
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    'registered'
                )
                RETURNING *
            `,
            [
                input.businessId,
                input.productId,
                input.clientCode
            ]
        );
    }
}