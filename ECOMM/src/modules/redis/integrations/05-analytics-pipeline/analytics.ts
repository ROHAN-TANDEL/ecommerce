// examples/redis/integrations/05-analytics-pipeline/analytics.ts
export function analyticsPipeline(context: any) {
    const { redis } = context;

    // ============ TRACK EVENT ============
    async function trackEvent(event: string, data: any) {
        const eventData = {
            id: crypto.randomUUID(),
            event,
            data,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        // Store event in time-series
        await redis.zadd(
            `events:${event}:${eventData.date}`,
            Date.now(),
            JSON.stringify(eventData)
        );

        // Store in daily aggregated events
        await redis.hincrby(`daily:events:${eventData.date}`, event, 1);

        // Update real-time counters
        await redis.incr(`realtime:events:${event}`);

        // Keep only last 7 days of real-time data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        await redis.client.zRemRangeByScore(
            `events:${event}:${eventData.date}`,
            0,
            sevenDaysAgo.getTime()
        );

        return eventData;
    }

    // ============ GET EVENT STATS ============
    async function getEventStats(event: string, date: string) {
        const count = await redis.hget(`daily:events:${date}`, event);
        return {
            event,
            date,
            count: parseInt(count) || 0
        };
    }

    // ============ GET EVENTS FOR PERIOD ============
    async function getEventsForPeriod(
        event: string,
        startDate: string,
        endDate: string
    ) {
        const results = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const count = await redis.hget(`daily:events:${dateStr}`, event);
            results.push({
                date: dateStr,
                count: parseInt(count) || 0
            });
            current.setDate(current.getDate() + 1);
        }

        return results;
    }

    // ============ GET TOP EVENTS ============
    async function getTopEvents(date: string, limit: number = 10) {
        const events = await redis.hgetall(`daily:events:${date}`);
        const sorted = Object.entries(events)
            .map(([event, count]) => ({
                event,
                count: parseInt(count)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return sorted;
    }

    // ============ GET REALTIME METRICS ============
    async function getRealtimeMetrics() {
        const keys = await redis.client.keys('realtime:events:*');
        const metrics: Record<string, number> = {};

        for (const key of keys) {
            const event = key.replace('realtime:events:', '');
            metrics[event] = await redis.get(key) || 0;
        }

        return metrics;
    }

    // ============ TRACK USER SESSION ============
    async function trackUserSession(userId: string, sessionData: any) {
        const session = {
            userId,
            ...sessionData,
            startTime: new Date().toISOString()
        };

        await redis.set(
            `session:${userId}`,
            session,
            3600 // 1 hour
        );

        return session;
    }

    // ============ GET ACTIVE USERS ============
    async function getActiveUsers() {
        const keys = await redis.client.keys('session:*');
        const users = [];

        for (const key of keys) {
            const userId = key.replace('session:', '');
            const session = await redis.get(key);
            if (session) {
                users.push({
                    userId,
                    ...session
                });
            }
        }

        return users;
    }

    return {
        trackEvent,
        getEventStats,
        getEventsForPeriod,
        getTopEvents,
        getRealtimeMetrics,
        trackUserSession,
        getActiveUsers
    };
}