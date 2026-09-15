import db from "../../../platformdb/facade.js";

export class ClientRepository {

    async createClient(input:any)
    {
        console.log(input);
        return await db.master.query(
            "SELECT current_schema()"
        );
    }
}