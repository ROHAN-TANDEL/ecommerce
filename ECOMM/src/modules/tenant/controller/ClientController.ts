export class ClientController {

    private readonly clientService:any;

    constructor({ clientService }:any)
    {
        this.clientService = clientService;
    }

    async create(request:any, response:any)
    {
        const result:any =
            await this.clientService.createClient(request.body);

        return response.json({
            status: true,
            data: result.rows[0]
        });
    }
}