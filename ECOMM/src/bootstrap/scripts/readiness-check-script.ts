export class ReadinessCheckScript {
    context;
    constructor(context: any) {
        this.context = context;
    }
    run() {
        return async (_req: any, res: any) => {
            try {
                await this.context.pool?.query('SELECT 1');
                if (!this.context.redisClient)
                    throw new Error('Redis client is unavailable');
                if (this.context.redisClient.ping)
                    await this.context.redisClient.ping();
                return res.status(200).json({ status: 'READY' });
            }
            catch (error) {
                this.context.logger.warn({ err: error }, 'readiness check failed');
                return res.status(503).json({ status: 'NOT_READY' });
            }
        };
    }
}
//# sourceMappingURL=readiness-check-script.js.map