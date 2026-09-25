export class BusinessService {

    private readonly businessRepository:any;

    constructor({ businessRepository }:any)
    {
        this.businessRepository = businessRepository;
    }

    async createBusiness(input:any)
    {
        return await this.businessRepository.createBusiness(input);
    }
}