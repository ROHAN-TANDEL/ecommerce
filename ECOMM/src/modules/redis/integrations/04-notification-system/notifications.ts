// examples/redis/integrations/04-notification-system/notifications.ts
export function notificationSystem(context: any) {
    const { redis } = context;

    const NOTIFICATION_PREFIX = 'notifications:';
    const USER_NOTIFICATION_PREFIX = 'user:notifications:';

    // ============ SEND NOTIFICATION ============
    async function sendNotification(userId: string, notification: any) {
        const id = crypto.randomUUID();
        const notificationData = {
            id,
            userId,
            ...notification,
            read: false,
            createdAt: new Date().toISOString()
        };

        // Store in user's notifications list
        await redis.lpush(
            `${USER_NOTIFICATION_PREFIX}${userId}`,
            JSON.stringify(notificationData)
        );
        await redis.ltrim(`${USER_NOTIFICATION_PREFIX}${userId}`, 0, 99); // Keep last 100

        // Publish real-time notification
        await redis.pubsub.publish(`user:${userId}:notifications`, notificationData);

        // Send email if needed
        if (notification.sendEmail) {
            await queueEmail(userId, notification);
        }

        return notificationData;
    }

    // ============ GET USER NOTIFICATIONS ============
    async function getUserNotifications(userId: string, limit: number = 20) {
        const notifications = await redis.lrange(
            `${USER_NOTIFICATION_PREFIX}${userId}`,
            0,
            limit - 1
        );

        return notifications.map((n: string) => JSON.parse(n));
    }

    // ============ MARK AS READ ============
    async function markAsRead(userId: string, notificationId: string) {
        const key = `${USER_NOTIFICATION_PREFIX}${userId}`;
        const notifications = await redis.lrange(key, 0, -1);

        for (const n of notifications) {
            const data = JSON.parse(n);
            if (data.id === notificationId) {
                data.read = true;
                await redis.lrem(key, 1, n);
                await redis.rpush(key, JSON.stringify(data));
                break;
            }
        }

        return { success: true };
    }

    // ============ MARK ALL AS READ ============
    async function markAllAsRead(userId: string) {
        const key = `${USER_NOTIFICATION_PREFIX}${userId}`;
        const notifications = await redis.lrange(key, 0, -1);

        for (const n of notifications) {
            const data = JSON.parse(n);
            data.read = true;
            await redis.lrem(key, 1, n);
            await redis.rpush(key, JSON.stringify(data));
        }

        return { success: true };
    }

    // ============ GET UNREAD COUNT ============
    async function getUnreadCount(userId: string) {
        const notifications = await redis.lrange(
            `${USER_NOTIFICATION_PREFIX}${userId}`,
            0,
            -1
        );

        return notifications.filter((n: string) => !JSON.parse(n).read).length;
    }

    // ============ SUBSCRIBE TO NOTIFICATIONS ============
    async function subscribeToNotifications(
        userId: string,
        handler: (notification: any) => Promise<void>
    ) {
        await redis.pubsub.subscribe(
            `user:${userId}:notifications`,
            async (notification) => {
                await handler(notification);
            }
        );
    }

    // ============ BULK NOTIFICATIONS ============
    async function sendBulkNotifications(userIds: string[], notification: any) {
        const results = [];
        for (const userId of userIds) {
            const result = await sendNotification(userId, notification);
            results.push(result);
        }
        return results;
    }

    // ============ SCHEDULED NOTIFICATION ============
    async function scheduleNotification(
        userId: string,
        notification: any,
        scheduleAt: Date
    ) {
        const scheduledKey = `scheduled:notifications:${userId}`;
        const data = {
            ...notification,
            scheduledAt: scheduleAt.toISOString()
        };

        // Store in sorted set with timestamp as score
        await redis.zadd(
            scheduledKey,
            scheduleAt.getTime(),
            JSON.stringify(data)
        );

        return { success: true };
    }

    // ============ PROCESS SCHEDULED NOTIFICATIONS ============
    async function processScheduledNotifications() {
        const now = Date.now();
        const keys = await redis.client.keys('scheduled:notifications:*');

        for (const key of keys) {
            const userId = key.split(':')[2];
            const notifications = await redis.client.zRangeByScore(
                key,
                0,
                now
            );

            for (const notification of notifications) {
                const data = JSON.parse(notification);
                await sendNotification(userId, data);
                await redis.client.zRem(key, notification);
            }
        }
    }

    // ============ HELPER: Queue Email ============
    async function queueEmail(userId: string, notification: any) {
        // Queue email via your existing queue system
        // await context.queue.publish('email', { userId, notification });
    }

    return {
        sendNotification,
        getUserNotifications,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
        subscribeToNotifications,
        sendBulkNotifications,
        scheduleNotification,
        processScheduledNotifications
    };
}