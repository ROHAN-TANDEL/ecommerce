// examples/redis/integrations/03-rate-limited-api/api.ts
export function rateLimitedApi(context: any) {
    const { redis } = context;

    // ============ API KEY VALIDATION ============
    async function validateApiKey(apiKey: string): Promise<{ valid: boolean; tier?: string; userId?: string }> {
        const keyData = await redis.get(`apikey:${apiKey}`);
        if (!keyData) {
            return { valid: false };
        }
        return {
            valid: true,
            tier: keyData.tier || 'free',
            userId: keyData.userId
        };
    }

    // ============ CHECK RATE LIMIT ============
    async function checkRateLimit(apiKey: string, endpoint: string): Promise<{
        allowed: boolean;
        limit: number;
        remaining: number;
        reset: number;
    }> {
        const keyData = await validateApiKey(apiKey);
        if (!keyData.valid) {
            return { allowed: false, limit: 0, remaining: 0, reset: 0 };
        }

        // Rate limits by tier
        const limits = {
            free: { limit: 100, window: 60 },      // 100 req/min
            premium: { limit: 1000, window: 60 },   // 1000 req/min
            enterprise: { limit: 10000, window: 60 } // 10000 req/min
        };

        const tier = keyData.tier || 'free';
        const { limit, window } = limits[tier as keyof typeof limits] || limits.free;
        const key = `rate:${apiKey}:${endpoint}`;

        const result = await redis.rateLimit.fixedWindow(key, limit, window);

        // Log usage for analytics
        await redis.zadd(`usage:${apiKey}`, Date.now(), endpoint);
        await redis.expire(`usage:${apiKey}`, 86400); // Keep for 24 hours

        return {
            allowed: result.allowed,
            limit,
            remaining: result.remaining,
            reset: result.reset
        };
    }

    // ============ GET API USAGE ============
    async function getApiUsage(apiKey: string, hours: number = 24) {
        const cutoff = Date.now() - (hours * 3600 * 1000);
        const usage = await redis.client.zRangeByScore(
            `usage:${apiKey}`,
            cutoff,
            Date.now()
        );

        const endpoints: Record<string, number> = {};
        for (const endpoint of usage) {
            endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
        }

        return {
            totalRequests: usage.length,
            endpoints,
            timeWindow: `${hours}h`
        };
    }

    // ============ RATE LIMIT MIDDLEWARE ============
    function rateLimitMiddleware() {
        return async (req: any, res: any, next: any) => {
            const apiKey = req.headers['x-api-key'];

            if (!apiKey) {
                return res.status(401).json({
                    status: 'error',
                    message: 'API key required'
                });
            }

            const result = await checkRateLimit(apiKey, req.path);

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', result.limit);
            res.setHeader('X-RateLimit-Remaining', result.remaining);
            res.setHeader('X-RateLimit-Reset', result.reset);

            if (!result.allowed) {
                return res.status(429).json({
                    status: 'error',
                    message: 'Rate limit exceeded',
                    retryAfter: result.reset - Math.floor(Date.now() / 1000)
                });
            }

            // Attach user info to request
            const keyData = await validateApiKey(apiKey);
            req.user = {
                id: keyData.userId,
                tier: keyData.tier
            };

            next();
        };
    }

    // ============ CREATE API KEY ============
    async function createApiKey(userId: string, tier: string = 'free') {
        const apiKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`;
        await redis.set(`apikey:${apiKey}`, {
            userId,
            tier,
            createdAt: new Date().toISOString()
        }, 31536000); // 1 year

        return apiKey;
    }

    // ============ REVOKE API KEY ============
    async function revokeApiKey(apiKey: string) {
        await redis.del(`apikey:${apiKey}`);
        return { success: true };
    }

    return {
        validateApiKey,
        checkRateLimit,
        getApiUsage,
        rateLimitMiddleware,
        createApiKey,
        revokeApiKey
    };
}