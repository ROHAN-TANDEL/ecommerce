// examples/redis/07-distributed-locks/lock.ts
export function lockExample(context: any) {
    const { redis } = context;

    // ============ ACQUIRE LOCK ============
    async function acquireLock(
        resource: string,
        ttl: number = 30,
        retryInterval: number = 100,
        maxRetries: number = 10
    ): Promise<string | null> {
        const lockKey = `lock:${resource}`;
        const lockValue = crypto.randomUUID();

        let attempts = 0;
        while (attempts < maxRetries) {
            // Try to set the lock using SETNX (set if not exists)
            const result = await redis.client.set(
                lockKey,
                lockValue,
                { NX: true, PX: ttl * 1000 }
            );

            if (result === 'OK') {
                console.log(`🔒 Lock acquired on ${resource}`);
                return lockValue;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }

        console.log(`❌ Failed to acquire lock on ${resource}`);
        return null;
    }

    // ============ RELEASE LOCK ============
    async function releaseLock(resource: string, lockValue: string): Promise<boolean> {
        const lockKey = `lock:${resource}`;

        // Use Lua script to ensure atomicity
        const luaScript = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;

        const result = await redis.client.eval(luaScript, {
            keys: [lockKey],
            arguments: [lockValue]
        });

        if (result === 1) {
            console.log(`🔓 Lock released on ${resource}`);
            return true;
        }

        console.log(`⚠️ Failed to release lock on ${resource}`);
        return false;
    }

    // ============ WITH LOCK (Auto-acquire and release) ============
    async function withLock<T>(
        resource: string,
        fn: () => Promise<T>,
        ttl: number = 30
    ): Promise<T> {
        const lockValue = await acquireLock(resource, ttl);
        if (!lockValue) {
            throw new Error(`Could not acquire lock on ${resource}`);
        }

        try {
            return await fn();
        } finally {
            await releaseLock(resource, lockValue);
        }
    }

    // ============ EXTEND LOCK ============
    async function extendLock(resource: string, lockValue: string, ttl: number = 30): Promise<boolean> {
        const lockKey = `lock:${resource}`;

        const luaScript = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("pexpire", KEYS[1], ARGV[2])
            else
                return 0
            end
        `;

        const result = await redis.client.eval(luaScript, {
            keys: [lockKey],
            arguments: [lockValue, ttl * 1000]
        });

        return result === 1;
    }

    return {
        acquireLock,
        releaseLock,
        withLock,
        extendLock
    };
}