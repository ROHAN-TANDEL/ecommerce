// context/redis/rate-limit.ts
export function rateLimiter(redis: any, operations: any) {
    // ============ FIXED WINDOW ============
    async function fixedWindow(key: string, limit: number, windowSeconds: number): Promise<{
        allowed: boolean;
        remaining: number;
        reset: number;
    }> {
        const current = await operations.incr(key);

        if (current === 1) {
            await operations.expire(key, windowSeconds);
        }

        const ttl = await operations.ttl(key);
        const remaining = Math.max(0, limit - current);

        return {
            allowed: current <= limit,
            remaining,
            reset: Math.floor(Date.now() / 1000) + ttl
        };
    }

    // ============ SLIDING WINDOW ============
    async function slidingWindow(key: string, limit: number, windowSeconds: number): Promise<{
        allowed: boolean;
        remaining: number;
        reset: number;
    }> {
        const now = Date.now();
        const windowStart = now - (windowSeconds * 1000);

        // Remove old requests
        await redis.getClient().zRemRangeByScore(key, 0, windowStart);

        // Count requests in window
        const count = await redis.getClient().zCount(key, windowStart, now);

        if (count < limit) {
            // Add current request
            await redis.getClient().zAdd(key, { score: now, value: `${now}-${Math.random()}` });
            await redis.getClient().expire(key, windowSeconds);
        }

        const remaining = Math.max(0, limit - count);

        return {
            allowed: count < limit,
            remaining,
            reset: Math.floor((Date.now() / 1000) + windowSeconds)
        };
    }

    // ============ TOKEN BUCKET ============
    async function tokenBucket(key: string, capacity: number, refillRate: number): Promise<{
        allowed: boolean;
        remaining: number;
    }> {
        const now = Date.now();
        const bucketKey = `bucket:${key}`;

        // Get current bucket state
        let bucket = await operations.get(bucketKey);
        let tokens: number;
        let lastRefill: number;

        if (bucket) {
            tokens = bucket.tokens;
            lastRefill = bucket.lastRefill;
        } else {
            tokens = capacity;
            lastRefill = now;
        }

        // Calculate refill
        const timePassed = (now - lastRefill) / 1000;
        const refillAmount = timePassed * refillRate;
        tokens = Math.min(capacity, tokens + refillAmount);

        const allowed = tokens >= 1;
        if (allowed) {
            tokens -= 1;
        }

        // Save bucket state
        await operations.set(bucketKey, { tokens, lastRefill: now }, 60);

        return {
            allowed,
            remaining: tokens
        };
    }

    // ============ RATE LIMIT MIDDLEWARE ============
    function middleware(limit: number, windowSeconds: number, strategy: 'fixed' | 'sliding' = 'fixed') {
        return async (req: any, res: any, next: any) => {
            const key = `rate-limit:${req.ip || req.user?.id || 'anonymous'}:${req.path}`;

            let result;
            if (strategy === 'fixed') {
                result = await fixedWindow(key, limit, windowSeconds);
            } else {
                result = await slidingWindow(key, limit, windowSeconds);
            }

            // Set headers
            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', result.remaining);
            res.setHeader('X-RateLimit-Reset', result.reset);

            if (!result.allowed) {
                return res.status(429).json({
                    status: 'error',
                    message: 'Too many requests, please try again later',
                    retryAfter: Math.ceil((result.reset - Date.now() / 1000))
                });
            }

            next();
        };
    }

    return {
        fixedWindow,
        slidingWindow,
        tokenBucket,
        middleware
    };
}