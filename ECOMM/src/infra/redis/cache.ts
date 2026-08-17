// context/redis/cache.ts
export function redisCache(redis: any, operations: any) {
    // ============ CACHE-ASIDE (Read-Through) ============
    async function getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl: number = 3600
    ): Promise<T> {
        // Try to get from cache
        const cached = await operations.get(key);
        if (cached !== null) {
            return cached as T;
        }

        // Cache miss - fetch from source
        const data = await fetchFn();

        // Store in cache
        await operations.set(key, data, ttl);

        return data;
    }

    // ============ BULK CACHE ============
    async function getBulk<T>(
        keys: string[],
        fetchFn: (missingKeys: string[]) => Promise<Record<string, T>>,
        ttl: number = 3600
    ): Promise<Record<string, T>> {
        const result: Record<string, T> = {};
        const missingKeys: string[] = [];

        // Get all from cache
        for (const key of keys) {
            const cached = await operations.get(key);
            if (cached !== null) {
                result[key] = cached as T;
            } else {
                missingKeys.push(key);
            }
        }

        // Fetch missing from source
        if (missingKeys.length > 0) {
            const fetched = await fetchFn(missingKeys);
            for (const [key, value] of Object.entries(fetched)) {
                result[key] = value;
                await operations.set(key, value, ttl);
            }
        }

        return result;
    }

    // ============ CACHE INVALIDATION ============
    async function invalidate(key: string) {
        await operations.del(key);
        return { success: true, key };
    }

    async function invalidatePattern(pattern: string) {
        const keys = await redis.getClient().keys(pattern);
        if (keys.length > 0) {
            await redis.getClient().del(keys);
        }
        return { success: true, pattern, keys: keys.length };
    }

    // ============ CACHE WITH TAGS ============
    async function setWithTags(key: string, value: any, tags: string[], ttl?: number) {
        // Store the value
        await operations.set(key, value, ttl);

        // Store tags for invalidation
        for (const tag of tags) {
            await operations.sadd(`cache:tag:${tag}`, key);
        }

        return { success: true, key, tags };
    }

    async function invalidateByTag(tag: string) {
        const keys = await operations.smembers(`cache:tag:${tag}`);
        if (keys.length > 0) {
            await redis.getClient().del(keys);
            await operations.del(`cache:tag:${tag}`);
        }
        return { success: true, tag, keys: keys.length };
    }

    return {
        getOrSet,
        getBulk,
        invalidate,
        invalidatePattern,
        setWithTags,
        invalidateByTag
    };
}