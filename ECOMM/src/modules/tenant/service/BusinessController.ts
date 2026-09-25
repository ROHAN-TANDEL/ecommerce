export class BusinessController {

    private readonly businessService:any;

    constructor({ businessService }:any)
    {
        this.businessService = businessService;
    }

    async create(request:any, response:any)
    {
        const result:any = await this.businessService.createBusiness(
            request.body
        );

        return response.json({
            status: true,
            data: result.rows[0]
        });
    }
}