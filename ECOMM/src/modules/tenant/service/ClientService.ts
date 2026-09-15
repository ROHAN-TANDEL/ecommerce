export class ClientService {

    private readonly clientRepository:any;

    constructor({ clientRepository }:any)
    {
        this.clientRepository = clientRepository;
    }

    async createClient(input:any)
    {
        return await this.clientRepository.createClient(input);
    }
}