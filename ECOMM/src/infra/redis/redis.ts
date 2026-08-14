import { createClient } from "redis";
export default class RedisRedis {
    context;
    constructor(context: any) {
        this.context = context;
    }
    async connect() {
        const redisUrl = 'redis://' + this.context.env.REDIS_USERNAME + ':'+ this.context.env.REDIS_PASSWORD +'@'+ this.context.env.REDIS_HOST +':' + this.context.env.REDIS_PORT;
        console.log(redisUrl);
        const connection:any = {
            url: redisUrl,
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