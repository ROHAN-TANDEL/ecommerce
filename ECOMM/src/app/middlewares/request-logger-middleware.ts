import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export class RequestLoggerMiddleware {

    context;

    constructor(context: any) {
        this.context = context;
    }

    startMiddleware() {
        console.log({ middleware_status: "setting request logger middleware..." });
        const registry = new Registry();
        collectDefaultMetrics({ register: registry });
        const requestCounter = new Counter({
            name: 'http_requests_total',
            help: 'Total HTTP requests processed by the API',
            labelNames: ['method', 'route', 'status_code'],
            registers: [registry],
        });
        const requestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status_code'],
            registers: [registry],
        });
        const appContext = this.context;
        return function (req: any, res: any, next: any) {
            const startedAt = Date.now();
            res.on("finish", () => {
                const route = req.originalUrl?.split('?')[0] ?? 'unknown';
                requestCounter.inc({ method: req.method, route, status_code: String(res.statusCode) });
                requestDuration.observe({ method: req.method, route, status_code: String(res.statusCode) }, Number(String(Date.now() - startedAt + "ms")));
                appContext.logger.info({
                    requestId: res.locals.requestId,
                    method: req.method,
                    path: req.originalUrl,
                    status: res.statusCode,
                    duration: Date.now() - startedAt + "ms"
                });
            });
            next();
        };
    }
}
//# sourceMappingURL=request-logger-middleware.js.map