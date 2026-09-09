import express from "express";
import { KernelContext } from "./src/bootstrap/app/app-context.js";

import { routeModules } from './src/modules/index.js';
import { AdminRoute } from './src/modules/admin/routes/AdminRoute.js';
import { createPlatformContext } from './src/platform/context.js';

import AuthRoute from "./src/modules/auth/AuthRoute.js";
import UserRoute from "./src/modules/user/UserRoute.js";
import ProductRoute from "./src/modules/product/ProductRoute.js";
import CheckoutRoute from "./src/modules/checkout/CheckoutRoute.js";
import OrderRoute from "./src/modules/order/OrderRoute.js";
import AuditRoute from "./src/modules/audit/AuditRoute.js";





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

    platform()
    {
        const platform = createPlatformContext(routeModules);
        return platform;
    }

    logPlatformInit(platform:any)
    {
        platform.products.logConfig();
    }

    autoRegisterApis(platform:any, app:any)
    {
        app.use('/api', platform.autoRegister());
    }

    // registerAdminRoutes(platform:any, app:any)
    // {
    //     const adminRoute = new AdminRoute(platform);
    //     app.use('/admin', adminRoute.route());
    // }

    platformBuild(app:any)
    {
        const platform = this.platform();
        this.logPlatformInit(platform);
        this.autoRegisterApis(platform, app);
        // this.registerAdminRoutes(platform, app);
        return platform;
    }
}
// todo FREEZ the object
const app = express();

const application = new Application();

application.appContext();

application.appBeforeMiddleware(app);

await application.runtime();

const context = application.buildContext();

context.platform = application.platformBuild(app);

//routes go here
app.use((new AuthRoute(context)).route(context));

app.use((new UserRoute(context)).route(context));

app.use((new ProductRoute(context)).route(context));

app.use((new CheckoutRoute(context)).route());

app.use((new AuditRoute(context)).route());

app.use((new OrderRoute(context)).route());

application.appAfterMiddleware(app);

export { app, context };
//# sourceMappingURL=app.js.map