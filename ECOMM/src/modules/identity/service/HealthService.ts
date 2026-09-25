export class HealthService {

    private readonly healthRepository:any;

    constructor(
        {
            healthRepository
        }:any
    ) {
        this.healthRepository = healthRepository;
    }

    async check()
    {
        return await this.healthRepository.check();
    }

    async getCustomers(page, limit)
    {
        return await this.healthRepository.getCustomers(page, limit);
    }

    async seedCustomers()
    {
        return await this.healthRepository.seedCustomers();
    }
}