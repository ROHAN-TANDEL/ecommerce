import db from "../../../platformdb/facade.js";

export class HealthRepository {

    async check()
    {
        return await db.master.query(
            "SELECT current_schema()"
        );
    }
}