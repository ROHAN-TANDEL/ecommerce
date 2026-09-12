import express from 'express';

export class TenantRoute {

    constructor(
        private readonly db:any
    ) {}

    route(context: any)
    {
        const childRouter = express.Router();


        childRouter.post(
            "/create/entries",
            async (req, res, next) => {

                const database = context.master;

                const result = await context.master.query(`
                                SELECT
                                    current_database(),
                                    current_schema()
                            `);

                res.json({
                    status: "success",
                    data: result.rows
                });
                return;
                try {

                    const {
                        business,
                        products
                    } = req.body;


                    // ==========================================
                    // START TRANSACTION
                    // ==========================================

                    await database.query(
                        "BEGIN"
                    );


                    // ==========================================
                    // CREATE BUSINESS
                    // ==========================================

                    const businessResult =
                        await database.query(
                            `
                            INSERT INTO businesses (
                                crm_id,
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

                            VALUES (
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
                                $13,
                                TRUE
                            )

                            RETURNING *
                            `,
                            [

                                business.crm_id,

                                business.name,

                                business.type || "external",

                                business.logo || null,

                                business.email || null,

                                business.phone || null,

                                business.website || null,

                                business.address_line_1 || null,

                                business.address_line_2 || null,

                                business.city || null,

                                business.state || null,

                                business.country || null,

                                business.postal_code || null

                            ]
                        );


                    const createdBusiness = businessResult.rows[0];


                    // ==========================================
                    // REGISTER PRODUCTS
                    // ==========================================

                    for (const product of products) {
                        // --------------------------------------
                        // FIND PRODUCT
                        // --------------------------------------

                        const productResult = await database.query(`SELECT * FROM products WHERE identifier = $1 AND status = TRUE `, [product.identifier]);

                        if (productResult.rows.length === 0) {
                            throw new Error(`Product not found: ${product.identifier}`);
                        }

                        const platformProduct = productResult.rows[0];


                        // --------------------------------------
                        // REGISTER BUSINESS PRODUCT
                        // --------------------------------------

                        await database.query(
                            `INSERT INTO business_products (business_id, product_id, status)
                             VALUES ($1, $2, TRUE)`,
                            [createdBusiness.id, platformProduct.id ]
                        );


                        // --------------------------------------
                        // CREATE CLIENT
                        // --------------------------------------

                        await database.query(
                            `
                            INSERT INTO clients (

                                business_id,

                                product_id,

                                schema_name,

                                host,

                                port,

                                username,

                                password,

                                status

                            )

                            VALUES (

                                $1,

                                $2,

                                $3,

                                $4,

                                $5,

                                $6,

                                $7,

                                TRUE

                            )
                            `,
                            [

                                createdBusiness.id,

                                platformProduct.id,

                                product.client.schema_name,

                                product.client.host,

                                product.client.port || 5432,

                                product.client.username,

                                product.client.password

                            ]
                        );

                    }


                    // ==========================================
                    // COMMIT TRANSACTION
                    // ==========================================

                    await database.query(
                        "COMMIT"
                    );


                    return res.status(201).json({

                        status: "success",

                        message:
                            "Business registered successfully",

                        data: {

                            business:
                            createdBusiness

                        }

                    });


                } catch (error) {

                    await database.query(
                        "ROLLBACK"
                    );

                    next(error);

                }

            }
        );


        return childRouter;
    }

    backup(context)
    {
        const childRouter = express.Router();

        childRouter.get(
            'health',
            async (req, res, next) => {

                try {

                    const result =
                        await context.master.query(
                            "SELECT NOW()"
                        );

                    res.json({
                        data: {
                            age: 22,
                            height: 5.5
                        },

                        status: "success",

                        msg: result.rows
                    });

                } catch (error) {

                    next(error);

                }
            }
        );

        return childRouter;
    }
}