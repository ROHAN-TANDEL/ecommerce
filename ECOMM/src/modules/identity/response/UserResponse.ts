export class UserResponse {

    modify(result:any)
    {
        return {
            status: true,
            data: result.rows
        };
    }
}