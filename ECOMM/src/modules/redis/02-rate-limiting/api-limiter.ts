// examples/redis/02-rate-limiting/api-limiter.ts
export function rateLimitExample(context: any) {
    const { redis } = context;

    // ============ API RATE LIMITER ============
    async function apiLimiter(req: any, res: any, next: any) {
        const userId = req.user?.id || req.ip;
        const endpoint = req.path;
        const key = `api:${userId}:${endpoint}`;

        // 100 requests per minute for free tier
        // 1000 requests per minute for premium
        const limit = req.user?.tier === 'premium' ? 1000 : 100;
        const windowSeconds = 60;

        const result = await redis.rateLimit.fixedWindow(key, limit, windowSeconds);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.reset);

        if (!result.allowed) {
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests',
                retryAfter: Math.ceil((result.reset - Date.now() / 1000))
            });
        }

        next();
    }

    // ============ LOGIN RATE LIMITER ============
    async function loginLimiter(email: string): Promise<{ allowed: boolean; message?: string }> {
        const key = `login:${email}`;
        const maxAttempts = 5;
        const windowSeconds = 300; // 5 minutes

        const result = await redis.rateLimit.fixedWindow(key, maxAttempts, windowSeconds);

        if (!result.allowed) {
            return {
                allowed: false,
                message: `Too many login attempts. Please wait ${Math.ceil(result.reset / 60)} minutes.`
            };
        }

        return { allowed: true };
    }

    // ============ SLIDING WINDOW FOR SENSITIVE OPS ============
    async function sensitiveOperationLimiter(userId: string) {
        const key = `sensitive:${userId}`;
        const limit = 10;
        const windowSeconds = 60;

        const result = await redis.rateLimit.slidingWindow(key, limit, windowSeconds);

        return {
            allowed: result.allowed,
            remaining: result.remaining,
            message: result.allowed
                ? `${result.remaining} operations remaining`
                : 'Rate limit exceeded'
        };
    }

    return {
        apiLimiter,
        loginLimiter,
        sensitiveOperationLimiter
    };
}