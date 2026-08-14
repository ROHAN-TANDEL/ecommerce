import express from 'express';

export class ExpressJsonMiddleware {
    context;
    constructor(context: any) {
        this.context = context;
    }
    startMiddleware() {
        console.log({ middleware_status: "setting express json middleware..." });
        return express.json(this.context.env.REQUEST_BODY_LIMIT);
    }
}
//# sourceMappingURL=express-json-middleware.js.map