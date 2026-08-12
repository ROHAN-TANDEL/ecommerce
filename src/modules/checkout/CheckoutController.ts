import { v4 as uuid4 } from 'uuid';

export default class CheckoutController {

    constructor(private readonly context: any) {
    }

    public getCart = async(req:any, res:any)=> {
        try {
            const userId = req.user.id;
            const query = `SELECT *, ci.id as id, ci.unit_price * ci.quantity AS subtotal,
                                  SUM(ci.unit_price * ci.quantity) OVER() AS overall_sum_total
            FROM master.carts AS ca

                            JOIN master.cart_items as ci 
                            ON ca.id = ci.cart_id
                            
                            left JOIN master.products as pr 
                            ON ci.product_id = pr.id
                            
                            WHERE user_id = $1
                            AND pr.status = $2
                            ORDER BY ci.updated_at ASC
                        `;
            const result = await this.context.client.query(query, [userId, 'ACTIVE']);

            if (result.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    data: {
                        "items": result.rows,
                        "subtotal":result.rows.at(0).overall_sum_total,
                        "totalItems" : result.rowCount
                    }
                });
            }

            return res.status(200).json({
                status: "success",
                data: []
            });

        } catch (error:any) {
            console.log(error.message);
            return res.status(400).json({
                status: "error",
                message: error.message
            })
        }
    }

    public addCartItem = async(req:any, res:any)=> {
        const userId = req.user.id;
        const {productId, quantity} = req.body;

        // check product exists
        const productQuery = `SELECT id, name, status, stock_quantity, price  FROM master.products WHERE id=$1 AND deleted_at IS NULL LIMIT 1`;
        const productResult = await this.context.client.query(productQuery, [productId]);

        const product = productResult.rowCount > 0;

        if(!product) {
            return res.status(404).json({
                "status": "failed",
                message: "Product not found"
            });
        }

        if(productResult.rows.at(0).status !== "ACTIVE") {
            return res.status(404).json({
                "status": "failed",
                message: "Product is unavailable"
            });
        }

        // check cart exists
        const cartQuery = `SELECT id FROM master.carts WHERE status=$1 AND user_id = $2 LIMIT 1`;
        let cartResult = await this.context.client.query(cartQuery, ['ACTIVE' , userId]);

        let cartCheck = cartResult.rowCount > 0;

        if (!cartCheck) {
            const cartQuery = `INSERT INTO master.carts (user_id) VALUES($1) RETURNING id`;
            cartResult = await this.context.client.query(cartQuery, [userId]);
            let cart = cartResult.rowCount > 0;

            if(!cart) {
                return res.status(404).json({
                    "status": "failed",
                    "message": "failed to add cart"
                });
            }
        }

        if (!cartCheck) {

            const cartItem = 'INSERT INTO master.cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *';

            const cartItemRes = await this.context.client.query(cartItem, [cartResult.rows.at(0).id, productResult.rows.at(0).id, quantity, productResult.rows.at(0).price]);
            if (cartItemRes.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    message: `item ${productResult.rows.at(0).name} added by ${quantity}`
                });
            }

            return res.status(400).json({
                status: "success",
                message: `failed to add ${productResult.rows.at(0).name} added by ${quantity}`
            });
        }

        const cartItem = 'UPDATE master.cart_items SET quantity = quantity + $1 WHERE product_id = $2 AND cart_id=$3 RETURNING *';
        const cartItemRes = await this.context.client.query(cartItem, [quantity, productResult.rows.at(0).id, cartResult.rows.at(0).id]);
        console.log([[quantity, productResult.rows.at(0).id, cartResult.rows.at(0).id]], cartItemRes);
        if (cartItemRes.rowCount > 0) {
            return res.status(200).json({
                status: "success",
                message: `item ${productResult.rows.at(0).name} quantity updated by ${quantity}`
            });
        }


        const cartIte = 'INSERT INTO master.cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *';

        const cartItemRe = await this.context.client.query(cartIte, [cartResult.rows.at(0).id, productResult.rows.at(0).id, quantity, productResult.rows.at(0).price]);
        if (cartItemRe.rowCount > 0) {
            return res.status(200).json({
                status: "success",
                message: `item ${productResult.rows.at(0).name} added by ${quantity}`
            });
        }

        return res.status(400).json({
            status: "success",
            message: `failed to add ${productResult.rows.at(0).name} added by ${quantity}`
        });

    }

    public updateCartItem = async(req:any, res:any) => {

        const itemId = req.params.id;
        const quantity = parseInt(req.body.quantity, 10);
        const userId = req.user.id;

        const query =  `SELECT *, ci.id as ciid FROM master.cart_items as ci
                            JOIN master.products as p
                                ON p.id = ci.product_id
                            JOIN master.carts as c
                                 ON c.user_id = $3
                            WHERE p.status = $1 AND
                             ci.id = $2
                        `;
        const result = await this.context.client.query(query, ['ACTIVE' , itemId, userId]);

        if(result.rowCount > 0) {
            const query = `UPDATE master.cart_items SET quantity = $1 WHERE id=$2 RETURNING *`;

            const cartRes = await this.context.client.query(query, [quantity, result.rows.at(0).ciid ]);

            if(cartRes.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    message: `item ${cartRes.rows.at(0).id} changed by ${quantity}`
                });
            }

            return res.status(400).json({
                status: "failed",
                message : "empty cart no such item"
            });
        }

        return res.status(400).json({
            status: "failed",
            message: "Invalid cart item"
        });
    }

    public deleteCartItem = async(req:any, res:any) => {
        const query = `DELETE FROM master.cart_items WHERE id = $1 RETURNING *`;
        const result = await this.context.client.query(query, [req.params.id]);

        if (result.rowCount > 0) {
            return res.status(200).json({
                status: "success",
                message: `item ${req.params.id} successfully deleted`
            });
        }

        return res.status(400).json({
            status: "failed",
            message: `failed to delete item ${req.params.id}`
        });
    }

    public deleteCart = async(req:any, res:any) => {
        const client = this.context.client;

        const  cartQ = `SELECT id FROM master.carts WHERE user_id=$1`;

        const cartRes = await client.query(cartQ, [req.user.id]);

        if (cartRes.rowCount > 0) {
            const query = `DELETE FROM master.cart_items WHERE cart_id = $1 RETURNING *`;
            const result = await client.query(query, [cartRes.rows.at(0).id]);

            if (result.rowCount > 0) {

                const  cartQ = `DELETE FROM master.carts WHERE user_id=$1`;

                const cartRes = await client.query(cartQ, [req.user.id]);

                if(cartRes.rowCount > 0) {

                    console.log(req?.checkout, req);
                    return res.status(200).json({
                        status: "success",
                        message: !(req?.checkout) ? `cart successfully deleted` : `cart is cleared and order is placed`
                    });

                }
            }
        }


        return res.status(400).json({
                status: "failed",
                message: `failed to delete cart`
            });
    }

    public  checkout = async(req:any, res:any, next:any)=> {
        const userId = req.user.id;
        const qry = `SELECT 1 FROM master.cart_items as ci JOIN master.carts AS ca ON ca.id = ci.cart_id WHERE ca.user_id=$1`;
        const cartResult = await this.context.client.query(qry, [userId]);

        if (cartResult.rowCount < 1) {
            return res.status(400).json({
                status: "success",
                message: "cart is empty"
            })
        }

        const qryItem = `
            SELECT ci.cart_id as cart_id
            FROM master.carts AS ca

                     JOIN master.cart_items as ci
                          ON ca.id = ci.cart_id

                     left JOIN master.products as pr
                               ON ci.product_id = pr.id

            WHERE ca.user_id = $1
              AND (pr.status != $2 OR ci.quantity > pr.stock_quantity)
            ORDER BY ci.updated_at ASC
        `;
        const qryItemRes = await this.context.client.query(qryItem, [userId, 'ACTIVE']);

        console.log(qryItemRes);
        if(qryItemRes.rowCount > 0) {
            return res.status(400).json({
                status: "success",
                message : "invalid product in the card"
            });
        }




        const qData = `select
                           COUNT(*),
                           cart_id,
                           SUM(cai.unit_price * cai.quantity)
                       from master.cart_items as cai
                                JOIN master.carts cas
                                     ON cas.id = cai.cart_id
                       where cas.user_id = $1
                       Group BY cart_id`;
        const cartDetail = await this.context.client.query(qData, [userId]);


        const client = await this.context.client.connect();

        await client.query('BEGIN');

        try {
            if(cartDetail.rowCount > 0) {
                const orderId = uuid4();
                const orderQ =  `INSERT INTO master.orders
                            (user_id,
                             order_number,
                             status,
                             subtotal,
                             total_items)
                         VALUES ($1, $2, $3, $4, $5) RETURNING *`;

                const orderRes = await client.query(orderQ, [userId, orderId, 'PENDING', cartDetail.rows.at(0).sum, cartDetail.rows.at(0).count]);

                if(orderRes.rowCount > 0) {

                    const orderItems = `INSERT INTO master.order_items 
                                            (order_id,
                                            product_id,
                                            quantity,
                                            unit_price,
                                            line_total)
                                        
                                        SELECT $1 as order_id,
                                               product_id,
                                               quantity,
                                               unit_price,
                                               unit_price * quantity AS line_total
                                        FROM master.cart_items AS cai
                                        WHERE cart_id = $2
                                        RETURNING *
                                        `;

                    const orderItem = await client.query(orderItems, [orderRes.rows.at(0).id, cartDetail.rows.at(0).cart_id]);

                    if(orderItem.rowCount > 0) {

                        req.client = client;
                        await client.query('COMMIT');
                        req.checkout = true;
                        next();
                        return;
                    }
                }
            }

            await client.query('ROLLBACK');
            return res.status(400).json({
                status: "success",
                message: "checkout failed"
            });
        } catch (error :any) {
            console.error(error);

            await client.query('ROLLBACK');

            return res.status(400).json({
                status: "failed",
                message: "check internal issue, try again later"
            });
        }
    }
}