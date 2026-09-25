export default class RedisCases {

    public constructor(private readonly context: any) {
    }

    redis = async(req:any,_res:any) => {
        // Example: Caching
        const context = this.context;
        const db = context.db;
        const userId = req.user.id;
        const userData = req.user;
        const sessionId = req.sessionId;

        const user = await context.redis.cache.getOrSet(
            `user:${userId}`,
            async () => {
                return await db.query('SELECT * FROM users WHERE id = $1', [userId]);
            },
            3600 // 1 hour
        );

        console.log({ user, sessionId });

// Example: Rate Limiting
        const result = await context.redis.rateLimit.fixedWindow(
            `api:${userId}`,
            100, // 100 requests
            60   // per minute
        );

        if (!result.allowed) {
            throw new Error('Rate limit exceeded');
        }

// Example: Pub/Sub
        await context.redis.pubsub.subscribe('notifications', async (message:any) => {
            console.log('📨 Notification:', message);
        });

        await context.redis.pubsub.publish('notifications', {
            type: 'user_created',
            userId: 123
        });

// Example: Session Management
        await context.redis.set(`session:${sessionId}`, userData, 86400);
        const session = await context.redis.get(`session:${sessionId}`);

// Example: Leaderboard
        await context.redis.zadd('leaderboard', 1000, userId);
        const topUsers = await context.redis.zrange('leaderboard', 0, 10, true);
        console.log({ session, topUsers });
    }
}