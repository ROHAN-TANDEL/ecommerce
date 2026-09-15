export class ProductController {

    private readonly productService:any;

    constructor({ productService }:any)
    {
        this.productService = productService;
    }

    async create(request:any, response:any)
    {
        const result:any = await this.productService.createProduct(
            request.body
        );

        return response.json({
            status: true,
            data: result.rows[0]
        });
    }
}