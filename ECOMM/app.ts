import express from "express";
import { KernelContext } from "./src/bootstrap/app/app-context.js";
import AuthRoute from "./src/modules/auth/AuthRoute.js";
import UserRoute from "./src/modules/user/UserRoute.js";
import ProductRoute from "./src/modules/product/ProductRoute.js";
import CheckoutRoute from "./src/modules/checkout/CheckoutRoute.js";
import OrderRoute from "./src/modules/order/OrderRoute.js";
import AuditRoute from "./src/modules/audit/AuditRoute.js";
import Platform, {preparePools, client} from "./src/platformdb/platform.js";

const [platformDetail, pools] = preparePools();

const poolClient = await client(platformDetail, pools, 'authorization_management', 'master');

try {

    const result = await poolClient.query(
        "SELECT NOW()"
    );

    console.log(result.rows);
} finally {
//    poolClient.release();
}


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
app.use('/health', context.scripts.health.check);

app.use((new AuthRoute(context)).route(context));

app.use((new UserRoute(context)).route(context));

app.use((new ProductRoute(context)).route(context));

app.use((new CheckoutRoute(context)).route());

app.use((new AuditRoute(context)).route());

app.use((new OrderRoute(context)).route());

application.appAfterMiddleware(app);

export { app, context };
//# sourceMappingURL=app.js.map