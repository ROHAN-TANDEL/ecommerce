import express from 'express';
export class UrlEncodedMiddleware {

    context;

    constructor(context: any) {
        this.context = context;
    }

    startMiddleware() {
        console.log({ middleware_status: "setting url encoded middleware..." });
        return express.urlencoded({ extended: false, limit: this.context.env.REQUEST_BODY_LIMIT });
    }
}
//# sourceMappingURL=url-encoded-middleware.js.map