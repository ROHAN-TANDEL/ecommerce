// context/redis/pubsub.ts
export function redisPubSub(redis: any) {
    const client = redis.connect();
    const publisher = client.duplicate();

    // ============ PUBLISH ============
    async function publish<T>(channel: string, message: T): Promise<number> {
        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        const subscriberCount = await publisher.publish(channel, payload);
        console.log(`Published to ${channel}: ${subscriberCount} subscribers`);
        return subscriberCount;
    }

    // ============ SUBSCRIBE ============
    async function subscribe<T>(
        channel: string,
        handler: (message: T) => Promise<void>
    ): Promise<void> {
        const subscriber = client.duplicate();
        await subscriber.connect();

        await subscriber.subscribe(channel, async (message:any) => {
            try {
                const data = JSON.parse(message) as T;
                await handler(data);
            } catch {
                await handler(message as T);
            }
        });

        console.log(`Subscribed to ${channel}`);
    }

    // ============ PATTERN SUBSCRIBE ============
    async function psubscribe<T>(
        pattern: string,
        handler: (channel: string, message: T) => Promise<void>
    ): Promise<void> {
        const subscriber = client.duplicate();
        await subscriber.connect();

        await subscriber.pSubscribe(pattern, async (message:any, channel:any) => {
            try {
                const data = JSON.parse(message) as T;
                await handler(channel, data);
            } catch {
                await handler(channel, message as T);
            }
        });

        console.log(`Subscribed to pattern: ${pattern}`);
    }

    // ============ UNSUBSCRIBE ============
    async function unsubscribe(channel: string): Promise<void> {
        const subscriber = client.duplicate();
        await subscriber.connect();
        await subscriber.unsubscribe(channel);
        console.log(`Unsubscribed from ${channel}`);
    }

    return {
        publish,
        subscribe,
        psubscribe,
        unsubscribe
    };
}