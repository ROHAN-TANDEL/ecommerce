import express from "express";
import { KernelContext } from "./src/bootstrap/app/app-context.js";
import Context from "./src/platformdb/context.js";
import SchemaConnect from "./src/platformdb/schema-connect.js";
import { SidebarRoute } from "./src/modules/navigation/routes/SidebarRoute.js";

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
let app = express();

const application = new Application();

application.appContext();

application.appBeforeMiddleware(app);

await application.runtime();

let context = application.buildContext();

(globalThis as any).context = context;

[app, context] = (new Context(app, context)).build();

//routes go here
app.use('/health', context.scripts.health.check);
const sidebarRoute = (new SidebarRoute()).route();
app.use('/sidebar', sidebarRoute);
app.use('/api/sidebar', sidebarRoute);

application.appAfterMiddleware(app);

const connection:any = new SchemaConnect().connect(
    "master",
    {
        host: "localhost",
        port: 5432,
        database: "nexora_identities_master",
        user: "root",
        password: "root123"
    }
);

console.log("connectiont esting");
const result:any = await connection.query(
    "SELECT current_schema()"
);

console.log(result.rows[0]);

export { app, context };
//# sourceMappingURL=app.js.map