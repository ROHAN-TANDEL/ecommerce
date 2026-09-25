export class UserController {

    private readonly healthService:any;

    private readonly healthValidator:any;

    private readonly healthResponse:any;

    constructor(
        {
            healthService,
            healthValidator,
            healthResponse
        }:any
    ) {
        this.healthService = healthService;
        this.healthValidator = healthValidator;
        this.healthResponse = healthResponse;
    }

    async check(
        request:any,
        response:any
    )
    {
        this.healthValidator.validate();

        const result = await this.healthService.check();

        return response.json(
            this.healthResponse.modify(result)
        );
    }
}