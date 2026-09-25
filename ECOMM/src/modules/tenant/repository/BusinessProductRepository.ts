import db from "../../../platformdb/facade.js";

export class BusinessProductRepository {

    async registerProduct(input:any)
    {
        return await db.master.query(
            `
                INSERT INTO business_products
                (
                    business_id,
                    product_id,
                    status,
                    enabled_at
                )
                VALUES
                (
                    $1,
                    $2,
                    'active',
                    CURRENT_TIMESTAMP
                )
                RETURNING *
            `,
            [
                input.businessId,
                input.productId
            ]
        );
    }
}