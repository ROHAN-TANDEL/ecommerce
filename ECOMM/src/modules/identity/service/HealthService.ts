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
}