import cors from "cors";
export class CorsRegisterMiddleWare {
    context;
    constructor(context: any) {
        this.context = context;
    }
    startMiddleware() {
        console.log({ middleware_status: "setting cors middleware..." });
        const allowedOrigins = this.context.env.CORS_ORIGIN.split(',').map((origin: any) => origin.trim());
        return cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins, credentials: !allowedOrigins.includes('*') });
    }
}
//# sourceMappingURL=cors-register-middleware.js.map