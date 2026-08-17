// examples/redis/integrations/06-distributed-sessions/sessions.ts
export function distributedSessions(context: any) {
    const { redis } = context;

    const SESSION_PREFIX = 'sess:';
    const SESSION_TTL = 86400; // 24 hours

    // ============ CREATE SESSION ============
    async function createSession(userId: string, data: any) {
        const sessionId = crypto.randomUUID();
        const session = {
            id: sessionId,
            userId,
            data,
            createdAt: new Date().toISOString(),
            lastAccess: new Date().toISOString()
        };

        await redis.set(
            `${SESSION_PREFIX}${sessionId}`,
            session,
            SESSION_TTL
        );

        // Add to user's sessions
        await redis.sadd(`user:sessions:${userId}`, sessionId);

        return sessionId;
    }

    // ============ GET SESSION ============
    async function getSession(sessionId: string) {
        const session = await redis.get(`${SESSION_PREFIX}${sessionId}`);
        if (!session) return null;

        // Update last access (sliding expiration)
        session.lastAccess = new Date().toISOString();
        await redis.set(
            `${SESSION_PREFIX}${sessionId}`,
            session,
            SESSION_TTL
        );

        return session;
    }

    // ============ UPDATE SESSION ============
    async function updateSession(sessionId: string, data: any) {
        const session = await getSession(sessionId);
        if (!session) return null;

        session.data = { ...session.data, ...data };
        session.lastAccess = new Date().toISOString();

        await redis.set(
            `${SESSION_PREFIX}${sessionId}`,
            session,
            SESSION_TTL
        );

        return session;
    }

    // ============ DESTROY SESSION ============
    async function destroySession(sessionId: string) {
        const session = await getSession(sessionId);
        if (session) {
            await redis.srem(`user:sessions:${session.userId}`, sessionId);
        }
        await redis.del(`${SESSION_PREFIX}${sessionId}`);
        return { success: true };
    }

    // ============ DESTROY ALL USER SESSIONS ============
    async function destroyAllUserSessions(userId: string) {
        const sessionIds = await redis.smembers(`user:sessions:${userId}`);
        for (const sessionId of sessionIds) {
            await redis.del(`${SESSION_PREFIX}${sessionId}`);
        }
        await redis.del(`user:sessions:${userId}`);
        return { success: true, count: sessionIds.length };
    }

    // ============ GET ALL USER SESSIONS ============
    async function getUserSessions(userId: string) {
        const sessionIds = await redis.smembers(`user:sessions:${userId}`);
        const sessions = [];

        for (const sessionId of sessionIds) {
            const session = await getSession(sessionId);
            if (session) {
                sessions.push(session);
            }
        }

        return sessions;
    }

    // ============ VALIDATE SESSION ============
    async function validateSession(sessionId: string): Promise<{ valid: boolean; userId?: string }> {
        const session = await getSession(sessionId);
        if (!session) {
            return { valid: false };
        }

        // Check if session is expired
        const sessionAge = Date.now() - new Date(session.createdAt).getTime();
        if (sessionAge > SESSION_TTL * 1000) {
            await destroySession(sessionId);
            return { valid: false };
        }

        return {
            valid: true,
            userId: session.userId
        };
    }

    // ============ SESSION MIDDLEWARE ============
    function sessionMiddleware() {
        return async (req: any, res: any, next: any) => {
            const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

            if (!sessionId) {
                req.session = null;
                return next();
            }

            const session = await getSession(sessionId);
            req.session = session;
            next();
        };
    }

    // ============ CLEANUP EXPIRED SESSIONS ============
    async function cleanupExpiredSessions() {
        const keys = await redis.client.keys(`${SESSION_PREFIX}*`);
        let cleaned = 0;

        for (const key of keys) {
            const session = await redis.get(key);
            if (!session) continue;

            const sessionAge = Date.now() - new Date(session.createdAt).getTime();
            if (sessionAge > SESSION_TTL * 1000) {
                await redis.del(key);
                cleaned++;
            }
        }

        return { cleaned };
    }

    return {
        createSession,
        getSession,
        updateSession,
        destroySession,
        destroyAllUserSessions,
        getUserSessions,
        validateSession,
        sessionMiddleware,
        cleanupExpiredSessions
    };
}