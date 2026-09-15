import {ClientRepository} from "../repository/ClientRepository.js";

export class ClientService {

    constructor() {
        this.clientRepository = app(ClientRepository);
    }

    async createClient(input)
    {
        return await this.clientRepository.createClient(input);
    }
}