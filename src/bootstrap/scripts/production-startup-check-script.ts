export class ProductionStartupCheckScript {

    context;

    constructor(context: any) {
        this.context = context;
    }

    run() {
        if (this.context.env.NODE_ENV === 'production') {
            const required = ['PG_MASTER_HOST', 'PG_MASTER_DATABASE', 'PG_MASTER_USERNAME', 'PG_MASTER_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
            const missing = required.filter((key) => !this.context.env[key]);
            if (missing.length > 0) {
                throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
            }
            if (this.context.env.CORS_ORIGIN === '*') {
                throw new Error('CORS_ORIGIN must be an explicit allowlist in production');
            }
        }
        return true;
    }
}
//# sourceMappingURL=production-startup-check-script.js.map