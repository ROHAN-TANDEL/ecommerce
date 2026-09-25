import requestContext from "./request-context.js";
import db from "./facade.js";

export default async function clientContext(req:any, res:any, next:any)
{
    const clientId = req.headers["x-client-id"] ?? req.headers["x-client-schema"] ;
console.log("client context");
    const result:any = await db.master.query(
        `
            SELECT id, schema_name
            FROM clients
            WHERE id = $1
              AND status = 'active'
            LIMIT 1
        `,
        [clientId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            status: false,
            message: "Client not found"
        });
    }

    const client:any = result.rows[0];

    requestContext.run(
        {
            clientId: client.id,
            schema: client.schema_name
        },
        () => next()
    );
}