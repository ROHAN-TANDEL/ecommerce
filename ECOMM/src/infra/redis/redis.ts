import { createClient } from "redis";
export default class RedisRedis {
    context;
    constructor(context) {
        this.context = context;
    }
    async connect() {
        const connection:any = {
            url: this.context.env.REDIS_URL,
            socket: {
                reconnectStrategy: false
            }
        };
        const redisClient = createClient(connection);
        // Startup/readiness report connection errors through the shared logger.
        redisClient.on('error', () => undefined);
        const server = await redisClient.connect();
        this.context.logger.info({ redis_status: "Redis Connected" });
        return server;
    }
}
//# sourceMappingURL=redis.js.map