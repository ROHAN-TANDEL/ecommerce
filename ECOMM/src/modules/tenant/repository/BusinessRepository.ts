import db from "../../../platformdb/facade.js";

export class BusinessRepository {

    async createBusiness(input:any)
    {
        return await db.master.query(
            `
                INSERT INTO businesses
                (
                    name,
                    type,
                    logo,
                    email,
                    phone,
                    website,
                    address_line_1,
                    address_line_2,
                    city,
                    state,
                    country,
                    postal_code,
                    status
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    'registered'
                )
                RETURNING *
            `,
            [
                input.name,
                input.type,
                input.logo,
                input.email,
                input.phone,
                input.website,
                input.address_line_1,
                input.address_line_2,
                input.city,
                input.state,
                input.country,
                input.postal_code
            ]
        );
    }
}