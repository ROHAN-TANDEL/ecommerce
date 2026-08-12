import express from 'express';
import path from "path";

export class ExpressStaticMiddleware {
    context;
    constructor(context: any) {
        this.context = context;
    }
    startMiddleware() {
        console.log({ middleware_status: "setting express static middleware..." });
        return express.static(path.join(import.meta.dirname, 'public'));
    }
}
//# sourceMappingURL=express-static-middleware.js.map