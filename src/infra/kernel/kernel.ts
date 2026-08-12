import { Database } from "../database/pgsql.js";
import Auth from "../auth/auth.js";
import RedisRedis from "../redis/redis.js";

export default class Kernel {

    constructor() {
    }

    connect() {
        return {
            clientDb: Database,
            auth: Auth,
            redis: RedisRedis
        };
    }
}
//# sourceMappingURL=kernel.js.map