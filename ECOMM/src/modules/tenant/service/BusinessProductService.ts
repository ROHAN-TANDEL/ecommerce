export class BusinessProductService {

    private readonly businessProductRepository:any;

    constructor({ businessProductRepository }:any)
    {
        this.businessProductRepository = businessProductRepository;
    }

    async registerProduct(input:any)
    {
        return await this.businessProductRepository.registerProduct(input);
    }
}