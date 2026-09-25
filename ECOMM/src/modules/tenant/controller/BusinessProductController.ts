export class BusinessProductController {

    private readonly businessProductService:any;

    constructor({ businessProductService }:any)
    {
        this.businessProductService = businessProductService;
    }

    async register(request:any, response:any)
    {
        const result:any =
            await this.businessProductService.registerProduct(
                request.body
            );

        return response.json({
            status: true,
            data: result.rows[0]
        });
    }
}