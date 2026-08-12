import express from "express";
import { KernelContext } from "./src/bootstrap/app/app-context.js";
import AuthRoute from "./src/modules/auth/AuthRoute.js";
import UserRoute from "./src/modules/user/UserRoute.js";
import ProductRoute from "./src/modules/product/ProductRoute.js";
class Application {

    context: any;
    boot: any;

    appContext() {
        this.boot = new KernelContext();
        this.context = this.boot.init();
        return this.context;
    }
    appBeforeMiddleware(app:any) {
        const context = this.context;
        app.use((new context.appMiddleware.before.helmetMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.corsMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.rateLimiterMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.requestIdMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.expressJsonMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.urlEncodedMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.cookieMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.before.expressStaticMiddleware(context)).startMiddleware());
    }
    appAfterMiddleware(app:any) {
        const context = this.context;
        app.use((new context.appMiddleware.after.routeNotFoundCheckMiddleware(context)).startMiddleware());
        app.use((new context.appMiddleware.after.globalErrorHandlerMiddleware(context)).startMiddleware());
    }
    async runtime() {
        const runtime = this.boot.runtimeContext();
        let db = new runtime.clientDb(this.context);
        this.context.db = db;
        this.context.client = db.connect();
        this.context.auth = new runtime.auth(this.context);
        this.context.redis = await (new runtime.redis(this.context)).connect();
    }
    buildContext() {
        return this.context;
    }
}
// todo FREEZ the object
const app = express();
const application = new Application();
application.appContext();
application.appBeforeMiddleware(app);
await application.runtime();
const context = application.buildContext();
//routes go here
app.use((new AuthRoute(context)).route(context));
app.use((new UserRoute(context)).route(context));
app.use((new ProductRoute(context)).route(context));
application.appAfterMiddleware(app);
export { app, context };
//# sourceMappingURL=app.js.map