import requestContext from "./request-context.js";

export default class Wrapper {

    constructor(
        private readonly pool:any
    ) {}

    async query(sql:any, values:any = [])
    {
        const context:any = requestContext.getStore();

        const client:any = await this.pool.connect();

        try {
            await client.query(`SET search_path TO ${context.schema}`);

            return await client.query(sql, values);

        } finally {
            client.release();
        }
    }

    async connect()
    {
        const context:any = requestContext.getStore();

        const client:any = await this.pool.connect();

        return client;
    }
}