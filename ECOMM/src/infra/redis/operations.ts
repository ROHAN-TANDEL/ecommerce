// context/redis/operations.ts
export function redisOperations(redis: any) {
    const client = redis.connect();

    // ============ STRINGS ============
    async function set(key: string, value: any, ttl?: number) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttl) {
            await client.setEx(key, ttl, stringValue);
        } else {
            await client.set(key, stringValue);
        }
        return { success: true, key };
    }

    async function get(key: string) {
        const value = await client.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    async function del(key: string) {
        await client.del(key);
        return { success: true, key };
    }

    async function exists(key: string) {
        return await client.exists(key) === 1;
    }

    async function expire(key: string, seconds: number) {
        await client.expire(key, seconds);
        return { success: true, key, ttl: seconds };
    }

    async function ttl(key: string) {
        return await client.ttl(key);
    }

    async function incr(key: string) {
        return await client.incr(key);
    }

    async function decr(key: string) {
        return await client.decr(key);
    }

    // ============ HASHES ============
    async function hset(key: string, field: string, value: any) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await client.hSet(key, field, stringValue);
        return { success: true, key, field };
    }

    async function hget(key: string, field: string) {
        const value = await client.hGet(key, field);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    async function hgetall(key: string) {
        const result = await client.hGetAll(key);
        const parsed: Record<string, any> = {};
        for (const [field, value] of Object.entries(result)) {
            try {
                if (typeof value === "string") {
                    parsed[field] = JSON.parse(value);
                } else {
                    throw Error(`Expected ${field} to be a string`);
                }
            } catch {
                parsed[field] = value;
            }
        }
        return parsed;
    }

    async function hdel(key: string, field: string) {
        await client.hDel(key, field);
        return { success: true, key, field };
    }

    // ============ LISTS ============
    async function lpush(key: string, value: any) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await client.lPush(key, stringValue);
        return { success: true, key };
    }

    async function rpush(key: string, value: any) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await client.rPush(key, stringValue);
        return { success: true, key };
    }

    async function lpop(key: string) {
        const value = await client.lPop(key);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    async function rpop(key: string) {
        const value = await client.rPop(key);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    async function lrange(key: string, start: number, stop: number) {
        const values = await client.lRange(key, start, stop);
        return values.map((v:any) => {
            try {
                return JSON.parse(v);
            } catch {
                return v;
            }
        });
    }

    // ============ SETS ============
    async function sadd(key: string, ...members: any[]) {
        const stringMembers = members.map(m => typeof m === 'string' ? m : JSON.stringify(m));
        await client.sAdd(key, stringMembers);
        return { success: true, key };
    }

    async function smembers(key: string) {
        const members = await client.sMembers(key);
        return members.map((m:any) => {
            try {
                return JSON.parse(m);
            } catch {
                return m;
            }
        });
    }

    async function srem(key: string, ...members: any[]) {
        const stringMembers = members.map(m => typeof m === 'string' ? m : JSON.stringify(m));
        await client.sRem(key, stringMembers);
        return { success: true, key };
    }

    async function sismember(key: string, member: any) {
        const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
        return await client.sIsMember(key, stringMember);
    }

    // ============ SORTED SETS ============
    async function zadd(key: string, score: number, member: any) {
        const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
        await client.zAdd(key, { score, value: stringMember });
        return { success: true, key };
    }

    async function zrange(key: string, start: number, stop: number, withScores: boolean = false) {
        const results = await client.zRange(key, start, stop, { WITHSCORES: withScores });
        if (!withScores) {
            return results.map((r:any) => {
                try {
                    return JSON.parse(r);
                } catch {
                    return r;
                }
            });
        }
        return results;
    }

    async function zrank(key: string, member: any) {
        const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
        return await client.zRank(key, stringMember);
    }

    async function zscore(key: string, member: any) {
        const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
        return await client.zScore(key, stringMember);
    }

    async function zincrby(key: string, increment: number, member: any) {
        const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
        return await client.zIncrBy(key, increment, stringMember);
    }
// todo differences between these
    return {
        // Strings
        set, get, del, exists, expire, ttl, incr, decr,
        // Hashes
        hset, hget, hgetall, hdel,
        // Lists
        lpush, rpush, lpop, rpop, lrange,
        // Sets
        sadd, smembers, srem, sismember,
        // Sorted Sets
        zadd, zrange, zrank, zscore, zincrby
    };
}