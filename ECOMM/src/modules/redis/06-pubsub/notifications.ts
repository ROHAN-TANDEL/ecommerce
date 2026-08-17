// examples/redis/06-pubsub/notifications.ts
export function notificationExample(context: any) {
    const { redis } = context;

    // ============ NOTIFICATION TYPES ============
    const NOTIFICATIONS = {
        USER_CREATED: 'user.created',
        USER_UPDATED: 'user.updated',
        ORDER_CREATED: 'order.created',
        ORDER_UPDATED: 'order.updated',
        PAYMENT_RECEIVED: 'payment.received',
        ALERT: 'alert',
        BROADCAST: 'broadcast'
    };

    // ============ PUBLISH NOTIFICATION ============
    async function publishNotification(type: string, data: any) {
        const message = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: new Date().toISOString()
        };

        await redis.pubsub.publish('notifications', message);
        console.log(`📤 Notification sent: ${type}`);
        return message;
    }

    // ============ SUBSCRIBE TO NOTIFICATIONS ============
    async function subscribeToNotifications(handler: (message: any) => Promise<void>) {
        await redis.pubsub.subscribe('notifications', async (message) => {
            console.log(`📥 Notification received: ${message.type}`);
            await handler(message);
        });
    }

    // ============ SUBSCRIBE BY TYPE ============
    async function subscribeToType(type: string, handler: (data: any) => Promise<void>) {
        await redis.pubsub.subscribe('notifications', async (message) => {
            if (message.type === type) {
                await handler(message.data);
            }
        });
    }

    // ============ USER-SPECIFIC NOTIFICATIONS ============
    async function sendUserNotification(userId: string, type: string, data: any) {
        const channel = `user:${userId}`;
        const message = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: new Date().toISOString()
        };

        await redis.pubsub.publish(channel, message);
        console.log(`📤 User notification sent to ${userId}: ${type}`);
    }

    async function subscribeToUserNotifications(
        userId: string,
        handler: (message: any) => Promise<void>
    ) {
        const channel = `user:${userId}`;
        await redis.pubsub.subscribe(channel, async (message) => {
            console.log(`📥 User notification for ${userId}: ${message.type}`);
            await handler(message);
        });
    }

    // ============ BROADCAST TO ALL ============
    async function broadcast(message: any) {
        await redis.pubsub.publish('broadcast', {
            id: crypto.randomUUID(),
            message,
            timestamp: new Date().toISOString()
        });
        console.log(`📤 Broadcast sent`);
    }

    async function subscribeToBroadcast(handler: (message: any) => Promise<void>) {
        await redis.pubsub.subscribe('broadcast', async (message) => {
            console.log(`📥 Broadcast received`);
            await handler(message);
        });
    }

    return {
        NOTIFICATIONS,
        publishNotification,
        subscribeToNotifications,
        subscribeToType,
        sendUserNotification,
        subscribeToUserNotifications,
        broadcast,
        subscribeToBroadcast
    };
}