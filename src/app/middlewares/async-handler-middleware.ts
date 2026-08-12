export class AsyncHandlerMiddleware {
    context;

    constructor(context: any) {
        this.context = context;
    }

    startMiddleware() {
        console.log({ middleware_status: "setting async error handler middleware..." });
        return (fn : any) => (req: any, res: any, next: any) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
//# sourceMappingURL=async-handler-middleware.js.map