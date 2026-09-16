import { Pool } from "pg";

export default class SchemaConnect {

    connect(schema:any, credentials:any)
    {
        return new Pool({
            ...credentials,
            options: `-c search_path=${schema}`
        });
    }
}