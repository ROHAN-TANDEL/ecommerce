export class UserRepository {

    private readonly db:any;

    constructor(
        {
            db
        }:any
    ) {
        this.db = db;
    }

    async check()
    {
        return await this.db.master.query(
            "SELECT current_schema()"
        );
    }
}