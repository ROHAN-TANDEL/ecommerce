export class SchemaController {

    constructor()
    {
    }

    async create(request:any, response:any)
    {

        console.log('context.schema');
        // console.log(context.schema);
        // context.schema.create('client_management', 'client');

        response.json({
            status: true,
            data: "schema creations"
        });
    }
}