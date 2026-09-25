// examples/redis/integrations/01-real-time-dashboard/dashboard.ts
export function realTimeDashboard(context: any) {
    const { redis } = context;

    // ============ METRICS COLLECTION ============
    async function collectMetrics() {
        const metrics = {
            users: {
                online: await redis.client.zCard('online:users'),
                total: await redis.get('metrics:users:total') || 0
            },
            orders: {
                today: await redis.get('metrics:orders:today') || 0,
                total: await redis.get('metrics:orders:total') || 0
            },
            revenue: {
                today: await redis.get('metrics:revenue:today') || 0,
                month: await redis.get('metrics:revenue:month') || 0
            },
            performance: {
                avgResponseTime: await redis.get('metrics:response:avg') || 0,
                errorRate: await redis.get('metrics:errors:rate') || 0
            },
            timestamp: new Date().toISOString()
        };

        // Store historical metrics
        await redis.zadd('metrics:history', Date.now(), JSON.stringify(metrics));
        // Keep only last 1000 entries
        await redis.client.zRemRangeByRank('metrics:history', 0, -1001);

        return metrics;
    }

    // ============ GET DASHBOARD DATA ============
    async function getDashboardData() {
        // Get current metrics
        const currentMetrics = await collectMetrics();

        // Get historical data for charts (last 24 hours)
        const history = await redis.zrange('metrics:history', -100, -1);
        const chartData = history.map((entry: string) => JSON.parse(entry));

        // Get recent activity
        const recentActivity = await redis.lrange('activity:feed', 0, 20);

        return {
            metrics: currentMetrics,
            chartData,
            recentActivity: recentActivity.map((item: string) => JSON.parse(item))
        };
    }

    // ============ LOG ACTIVITY ============
    async function logActivity(type: string, data: any) {
        const entry = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: new Date().toISOString()
        };

        await redis.lpush('activity:feed', JSON.stringify(entry));
        await redis.ltrim('activity:feed', 0, 99); // Keep only last 100

        // Publish to dashboard subscribers
        await redis.pubsub.publish('dashboard:update', entry);

        return entry;
    }

    // ============ UPDATE METRIC ============
    async function updateMetric(key: string, value: any) {
        await redis.set(`metrics:${key}`, value);
        await redis.pubsub.publish('metrics:update', { key, value });
        return { success: true };
    }

    // ============ INCREMENT METRIC ============
    async function incrementMetric(key: string, by: number = 1) {
        const newValue = await redis.incr(`metrics:${key}`);
        await redis.pubsub.publish('metrics:update', { key, value: newValue });
        return newValue;
    }

    // ============ SUBSCRIBE TO DASHBOARD UPDATES ============
    async function subscribeToDashboard(handler: (update: any) => Promise<void>) {
        await redis.pubsub.subscribe('dashboard:update', handler);
        await redis.pubsub.subscribe('metrics:update', handler);
    }

    return {
        collectMetrics,
        getDashboardData,
        logActivity,
        updateMetric,
        incrementMetric,
        subscribeToDashboard
    };
}