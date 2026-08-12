import helmet from 'helmet';
export class HelmetMiddleware {

    context;

    constructor(context: any) {
        this.context = context;
    }

    startMiddleware() {
        console.log({ middleware_status: "setting helmet middleware..." });
        return helmet();
    }

}
//# sourceMappingURL=helmet-middleware.js.map