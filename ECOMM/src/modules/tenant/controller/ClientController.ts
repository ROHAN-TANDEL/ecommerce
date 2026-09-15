import {ClientService} from "../service/ClientService.js";
import {ClientResponse} from "../response/ClientResponse.js";

export class ClientController {

    constructor() {
        this.clientService = app(ClientService);
        this.clientResponse = app(ClientResponse);
    }

    async createClient(request:any, response:any)
    {
        const input:any = request.body;

        const client : any = await this.clientService.createClient(input);

        const data : any = this.clientResponse.response(client);

        response.json(data);
    }
}