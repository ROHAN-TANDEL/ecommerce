export class HealthResponse {

    modify(result:any)
    {
        return {
            status: true,
            data: result.rows
        };
    }
}