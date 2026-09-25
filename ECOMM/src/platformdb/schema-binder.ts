export default function schemaBinder(req:any, res:any, next:any)
{
    const schema:any = requestContext.getStore()?.schema;

    const client:any = new SchemaConnect().connect(
        schema,
        credentials
    );

    requestContext.getStore().client = client;

    next();
}