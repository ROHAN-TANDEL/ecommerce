import { Pool } from "pg";

export class Database {


    context;

    constructor(context: any) {
        this.context = context;
    }

    connect() {
        console.info({ infra_status: " DB connection started... " });
        return new Pool({
            host: this.context.env.PG_MASTER_HOST,
            port: this.context.env.PG_MASTER_PORT,
            user: this.context.env.PG_MASTER_USERNAME,
            password: this.context.env.PG_MASTER_PASSWORD,
            database: this.context.env.PG_MASTER_DATABASE
        });
    }

    async disconnect(pool: any) {
        console.info({ infra_status: " DB connection stopped... " });
        await pool.end();
    }

    async cleanUp(pool: any) {
        console.info({ infra_status: " DB connection cleanup... " });
        await this.disconnect(pool);
    }

    print(text:any, params:any) {

        try {
            const formatValueForLog = (val) => {
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`; // Escape single quotes
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'object') return `'${JSON.stringify(val)}'`;
                return val;
            };

            const execute = async (text, params) => {
                let exactSql = text;
                if (params && params.length > 0) {
                    for (let i = params.length - 1; i >= 0; i--) {
                        const placeholder = new RegExp(`\\$${i + 1}(?!\\d)`, 'g');
                        exactSql = exactSql.replace(placeholder, formatValueForLog(params[i]));
                    }
                }
                console.log(`\x1b[35m[TX SQL EXEC]\x1b[0m ${exactSql}`); // Magenta colored prefix
            };

            execute(text, params);

            return true;
        } catch (error) {
            console.error("query printing failed");
            console.error(error);
            return false;
        }
    }
}
//# sourceMappingURL=database_connect.js.map