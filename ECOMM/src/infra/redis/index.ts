// context/redis/index.ts
import { redisConnection } from './client.js';
import { redisOperations } from './operations.js';
import { redisCache } from './cache.js';
import { rateLimiter } from './rate-limit.js';
import { redisPubSub } from './pubsub.js';

export function redisModule(context: any) {
    const env = context.env || process.env;

    // 1. Connection
    const connection = redisConnection(env);
    const client = connection.connect();

    // 2. Operations
    const operations = redisOperations(connection);

    // 3. Cache
    const cache = redisCache(connection, operations);

    // 4. Rate Limiter
    const rateLimit = rateLimiter(connection, operations);

    // 5. Pub/Sub
    const pubsub = redisPubSub(connection);

    return {
        // Connection
        connect: connection.connect,
        disconnect: connection.disconnect,
        healthCheck: connection.healthCheck,
        client: connection.getClient,
        clientConnect : client,
        // Operations
        ops: operations,

        // Cache
        cache,

        // Rate Limiter
        rateLimit,

        // Pub/Sub
        pubsub,

        // Helper: raw operations
        set: operations.set,
        get: operations.get,
        del: operations.del,
        exists: operations.exists,
        expire: operations.expire,
        ttl: operations.ttl,
        incr: operations.incr,
        decr: operations.decr,

        // Hash operations
        hset: operations.hset,
        hget: operations.hget,
        hgetall: operations.hgetall,
        hdel: operations.hdel,

        // List operations
        lpush: operations.lpush,
        rpush: operations.rpush,
        lpop: operations.lpop,
        rpop: operations.rpop,
        lrange: operations.lrange,

        // Set operations
        sadd: operations.sadd,
        smembers: operations.smembers,
        srem: operations.srem,
        sismember: operations.sismember,

        // Sorted Set operations
        zadd: operations.zadd,
        zrange: operations.zrange,
        zrank: operations.zrank,
        zscore: operations.zscore,
        zincrby: operations.zincrby
    };
}

// Default export
export default redisModule;