import cookieParser from 'cookie-parser';
export class CookieMiddleware {
    context;
    constructor(context: any) {
        this.context = context;
    }
    startMiddleware() {
        console.log({ middleware_status: "setting cookie middleware..." });
        return cookieParser();
    }
}
//# sourceMappingURL=cookie-parser-middleware.js.map