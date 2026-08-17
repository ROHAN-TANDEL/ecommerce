// examples/redis/01-caching/user-cache.ts
import { createContext } from '../../../context';

export function userCacheExample(context: any) {
    const { redis, db } = context;

    // ============ GET USER WITH CACHE ============
    async function getUser(userId: string) {
        return await redis.cache.getOrSet(
            `user:${userId}`,
            async () => {
                // Cache miss - fetch from database
                console.log(`📦 Cache miss for user ${userId}, fetching from DB...`);
                const result = await db.query(
                    'SELECT id, first_name, last_name, email FROM users WHERE id = $1',
                    [userId]
                );
                return result.rows[0] || null;
            },
            3600 // 1 hour TTL
        );
    }

    // ============ GET MULTIPLE USERS ============
    async function getUsers(userIds: string[]) {
        return await redis.cache.getBulk(
            userIds.map(id => `user:${id}`),
            async (missingKeys: string[]) => {
                // Fetch missing users from DB
                const ids = missingKeys.map(key => key.replace('user:', ''));
                const result = await db.query(
                    'SELECT id, first_name, last_name, email FROM users WHERE id = ANY($1)',
                    [ids]
                );
                const users: Record<string, any> = {};
                for (const row of result.rows) {
                    users[`user:${row.id}`] = row;
                }
                return users;
            },
            3600
        );
    }

    // ============ UPDATE USER (Invalidate Cache) ============
    async function updateUser(userId: string, data: any) {
        // Update database
        await db.query(
            'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
            [data.first_name, data.last_name, userId]
        );

        // Invalidate cache
        await redis.cache.invalidate(`user:${userId}`);

        // Also invalidate all users list cache
        await redis.cache.invalidatePattern('users:list:*');

        return { success: true, userId };
    }

    // ============ DELETE USER ============
    async function deleteUser(userId: string) {
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        await redis.cache.invalidate(`user:${userId}`);
        await redis.cache.invalidatePattern('users:list:*');
        return { success: true, userId };
    }

    return {
        getUser,
        getUsers,
        updateUser,
        deleteUser
    };
}