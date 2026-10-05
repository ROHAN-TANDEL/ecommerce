// examples/redis/03-sessions/session-store.ts
export function sessionStoreExample(context: any) {
    const { redis } = context;

    // ============ CREATE SESSION ============
    async function createSession(userId: string, data: any) {
        const sessionId = crypto.randomUUID();
        const sessionData = {
            userId,
            ...data,
            createdAt: new Date().toISOString()
        };

        await redis.set(`session:${sessionId}`, sessionData, 86400); // 24 hours
        await redis.sadd(`user:sessions:${userId}`, sessionId);

        return {
            sessionId,
            expiresIn: 86400
        };
    }

    // ============ GET SESSION ============
    async function getSession(sessionId: string) {
        const session = await redis.get(`session:${sessionId}`);
        if (!session) return null;

        // Extend session on access (sliding expiration)
        await redis.expire(`session:${sessionId}`, 86400);

        return session;
    }

    // ============ DESTROY SESSION ============
    async function destroySession(sessionId: string) {
        const session = await redis.get(`session:${sessionId}`);
        if (session) {
            await redis.srem(`user:sessions:${session.userId}`, sessionId);
        }
        await redis.del(`session:${sessionId}`);
        return { success: true };
    }

    // ============ DESTROY ALL USER SESSIONS ============
    async function destroyAllUserSessions(userId: string) {
        const sessions = await redis.smembers(`user:sessions:${userId}`);
        for (const sessionId of sessions) {
            await redis.del(`session:${sessionId}`);
        }
        await redis.del(`user:sessions:${userId}`);
        return { success: true, sessions: sessions.length };
    }

    // ============ GET ALL USER SESSIONS ============
    async function getUserSessions(userId: string) {
        const sessionIds = await redis.smembers(`user:sessions:${userId}`);
        const sessions = [];
        for (const sessionId of sessionIds) {
            const session = await redis.get(`session:${sessionId}`);
            if (session) {
                sessions.push({ sessionId, ...session });
            }
        }
        return sessions;
    }

    return {
        createSession,
        getSession,
        destroySession,
        destroyAllUserSessions,
        getUserSessions
    };
}