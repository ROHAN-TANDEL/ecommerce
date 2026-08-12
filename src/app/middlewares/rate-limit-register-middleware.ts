import rateLimit from 'express-rate-limit';

export class RateLimitRegisterMiddleware {

    context;

    constructor(context: any) {
        this.context = context;
    }

    startMiddleware() {
        console.log({ middleware_status: "setting rate limiter middleware..." });
        return rateLimit({ windowMs: this.context.env.RATE_LIMIT_WINDOW_MS, max: this.context.env.RATE_LIMIT_MAX, standardHeaders: true, legacyHeaders: false });
    }
}
//# sourceMappingURL=rate-limit-register-middleware.js.map