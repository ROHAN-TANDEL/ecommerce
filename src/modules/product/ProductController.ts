export default class ProductController {

    context;

    constructor(context) {
        this.context = context;
    }

    getProducts = async (req, res) => {
        try {
            const query = `SELECT * FROM master.products WHERE deleted_at IS NULL ORDER BY id ASC  OFFSET $1 LIMIT $2`;
            const result = await this.context.client.query(query, [req.query.offset, req.query.limit]);
            if (result.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    data: result.rows
                });
            }
            return res.status(200).json({
                status: "success",
                data: []
            });
        }
        catch (error) {
            console.error("Product error:", error);
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }

    getProduct = async (req, res) => {
        try {
            const id = req.params.id;
            const cacheKey = `get-product:${id}`;
            const cachedProduct = await this.context.redis.get(cacheKey);
            if (cachedProduct) {
                return res.json({ status: "success", data: JSON.parse(cachedProduct) });
            }
            const query = `SELECT * FROM master.products 
                            WHERE id=$1 AND deleted_at IS NULL`;
            const result = await this.context.client.query(query, [id]);
            if (result.rowCount > 0) {
                await this.context.redis.setEx(cacheKey, 30, JSON.stringify(result.rows));
                return res.status(200).json({
                    status: "success",
                    data: result.rows
                });
            }
            await this.context.redis.setEx(cacheKey, 30, "");
            return res.status(200).json({
                status: "success",
                data: []
            });
        }
        catch (error) {
            console.error("Product error:", error);
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }

    createProduct = async () => {
    }

    deleteProduct = async (req, res) => {
        try {
            const id = req.params.id;
            const query = `UPDATE master.products SET deleted_at=NOW() WHERE id=$$1`;
            const result = await this.context.client.query(query, [id]);
            if (result.rowCount > 0) {
                const cacheKey = `get-product:${id}`;
                await this.context.redis.del(cacheKey);
                return res.status(200).json({
                    status: "success",
                    data: { id: id }
                });
            }
        }
        catch (error) {
            console.error("Product error:", error);
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }

    updateProduct = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const query = `UPDATE master.products SET 
                            sku = COALESCE($1, sku),
                            name = COALESCE($2, name),
                            description = COALESCE($3, description),
                            price = COALESCE($4, price),
                            stock_quantity = COALESCE($5, stock_quantity),
                            status = COALESCE($6, status),
                            version = COALESCE($7, version)
                            
                            WHERE version = $8 and id=$9 AND deleted_at IS NULL`;

            const input = [
                data?.sku,
                data?.name,
                data?.description,
                data?.price,
                data?.stock_quantity,
                data?.status,
                data?.version + 1,
                data?.version,
                id
            ];

            this.context.db.print(query, input);
            const result = await this.context.client.query(query, input);

            if (result.rowCount > 0) {
                const cacheKey = `get-product:${id}`;
                await this.context.redis.del(cacheKey);
                return res.status(200).json({
                    status: "success",
                    data: result.rowCount
                });
            }

            return res.status(400).json({
                status: "error",
                message: "Product update failed"
            });
        }
        catch (error) {
            console.error("Product error:", error);
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }
}
//# sourceMappingURL=ProductController.js.map