export class ClientResponse {

    response(result:any)
    {
        return {
            status: true,
            data: result.rows
        };
    }
}