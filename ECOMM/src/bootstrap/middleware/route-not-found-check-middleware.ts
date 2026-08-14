export default class RouteNotFoundCheckMiddleware {
    context;
    constructor(context: any) {
        this.context = context;
    }
    startMiddleware() {
        console.info({ route_not_found: "registering route not found middleware... " });
        return (req: any, res: any) => res.status(404).json({
            status: 'failed',
            message: `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
}
//# sourceMappingURL=route-not-found-check-middleware.js.map