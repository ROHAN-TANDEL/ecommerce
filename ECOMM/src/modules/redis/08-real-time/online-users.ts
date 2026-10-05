// examples/redis/08-real-time/online-users.ts
export function onlineUsersExample(context: any) {
    const { redis } = context;

    const ONLINE_USERS_KEY = 'online:users';
    const USER_SESSION_KEY = 'online:session:';

    // ============ USER ONLINE ============
    async function userOnline(userId: string, sessionId: string) {
        const now = Date.now();

        // Add to online users set with timestamp
        await redis.zadd(ONLINE_USERS_KEY, now, userId);

        // Store session info
        await redis.set(`${USER_SESSION_KEY}${userId}`, {
            userId,
            sessionId,
            lastSeen: now,
            status: 'online'
        }, 300); // 5 minutes TTL

        console.log(`🟢 User ${userId} is online`);
        return { success: true };
    }

    // ============ USER OFFLINE ============
    async function userOffline(userId: string) {
        await redis.zrem(ONLINE_USERS_KEY, userId);
        await redis.del(`${USER_SESSION_KEY}${userId}`);
        console.log(`🔴 User ${userId} is offline`);
        return { success: true };
    }

    // ============ HEARTBEAT (Keep alive) ============
    async function heartbeat(userId: string) {
        const exists = await redis.sismember(ONLINE_USERS_KEY, userId);
        if (!exists) {
            // User was offline, bring them online
            await userOnline(userId, 'heartbeat');
        } else {
            // Update last seen
            const now = Date.now();
            await redis.zadd(ONLINE_USERS_KEY, now, userId);
            await redis.expire(`${USER_SESSION_KEY}${userId}`, 300);
        }
        return { success: true };
    }

    // ============ GET ONLINE USERS ============
    async function getOnlineUsers(limit: number = 100) {
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);

        // Remove stale entries
        await redis.client.zRemRangeByScore(ONLINE_USERS_KEY, 0, fiveMinutesAgo);

        // Get active users
        const users = await redis.zrange(ONLINE_USERS_KEY, 0, limit - 1);

        // Get user details
        const userDetails = [];
        for (const userId of users) {
            const info = await redis.get(`${USER_SESSION_KEY}${userId}`);
            if (info) {
                userDetails.push({
                    userId,
                    ...info,
                    status: 'online'
                });
            }
        }

        return {
            count: userDetails.length,
            users: userDetails
        };
    }

    // ============ GET ONLINE COUNT ============
    async function getOnlineCount() {
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);

        // Clean stale entries
        await redis.client.zRemRangeByScore(ONLINE_USERS_KEY, 0, fiveMinutesAgo);

        return await redis.client.zCard(ONLINE_USERS_KEY);
    }

    // ============ IS USER ONLINE ============
    async function isUserOnline(userId: string): Promise<boolean> {
        return await redis.sismember(ONLINE_USERS_KEY, userId);
    }

    return {
        userOnline,
        userOffline,
        heartbeat,
        getOnlineUsers,
        getOnlineCount,
        isUserOnline
    };
}