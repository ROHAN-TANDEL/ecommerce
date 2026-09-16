import db from "../../../platformdb/facade.js";

export class SchemaController {

    constructor()
    {
    }

    async create(request:any, response:any)
    {
//        await context.schema.create('client_management', '1000001');

        console.log('asd aas. sss dd');
        console.log(db);
        console.log(db.client);

        response.json({
            status: true,
            data: "schema creations",
            client : await db.client
        });
    }
}