import requestContext from "./request-context.js";

export default function clientContext(req:any, res:any, next:any)
{
    const schema = req.headers["x-client-schema"];

    console.log("CLIENT CONTEXT:", schema);

    requestContext.run(
        { schema },
        () => next()
    );
}