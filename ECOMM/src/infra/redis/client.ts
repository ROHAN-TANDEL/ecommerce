import { createClient, type RedisClientType } from 'redis';

export function redisConnection(context: any) {
    let client: RedisClientType | null = null;

    function connect() {
        if (client && client.isReady) {
            return client;
        }

        const url = 'redis://' + context.env.REDIS_USERNAME + ':'+ context.env.REDIS_PASSWORD +'@'+ context.env.REDIS_HOST +':' + context.env.REDIS_PORT;

        client = createClient({
            url,
            socket: {
                reconnectStrategy: (retries: number) => {
                    if (retries > 10) {
                        console.error('Redis connection failed after 10 retries');
                        return new Error('Redis connection failed');
                    }
                    //todo what is the return random number
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        client.on('connect', () => {
            console.log('Redis Client Connected');
        });

        client.on('ready', () => {
            console.log('Redis Client Ready');
        });

        return client;
    }

    async function disconnect() {
        if (client) {
            await client.quit();
            client = null;
            console.log('Redis Client Disconnected');
        }
    }

    async function healthCheck() {
        try {
            const client = connect();
            await client.ping();
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error: any) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    return {
        connect,
        disconnect,
        healthCheck,
        getClient: () => client
    };
}