import { createClient } from "redis";
export default class RedisRedis {
    context;
    constructor(context: any) {
        this.context = context;
    }
    async connect() {
        const {
            REDIS_HOST,
            REDIS_PORT,
            REDIS_USERNAME,
            REDIS_PASSWORD,
            REDIS_TLS,
            NODE_ENV
        } = this.context.env;

        let protocol = REDIS_TLS === "true" ? "rediss" : "redis";

        if (NODE_ENV === 'production') {
            protocol = 'rediss';
        } else {
            protocol = 'redis';
        }

        let redisUrl = `${protocol}://${REDIS_HOST}:${REDIS_PORT}`;

        if (REDIS_USERNAME && REDIS_PASSWORD) {
            redisUrl =
                `${protocol}://${encodeURIComponent(REDIS_USERNAME)}:` +
                `${encodeURIComponent(REDIS_PASSWORD)}@` +
                `${REDIS_HOST}:${REDIS_PORT}`;
        }

        console.log({
            "redisconnect": `Redis connection: ${protocol}://${REDIS_HOST}:${REDIS_PORT}`
            }
        );

        const connection: any = {
            url: redisUrl,
            socket: {
                reconnectStrategy: false
            }
        };

        const redisClient = createClient(connection);

        redisClient.on("error", () => undefined);

        const server = await redisClient.connect();

        this.context.logger.info({
            redis_status: "Redis Connected"
        });

        this.context.logger.info({ redis_status: "Redis Connected" });

        return server;
    }
}
//# sourceMappingURL=redis.js.map