import requestContext from "./request-context.js";

export default function clientContext(req:any, res:any, next:any)
{
    const schema = 'tenant_002';//req.headers["x-client-schema"];

    requestContext.run(
        { schema },
        () => next()
    );
}