import express from "express";
import { KernelContext } from "./src/bootstrap/app/app-context.js";
import Platform, { type ApiRegistration } from "./src/platform/index.js";

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
        // ============================================================
// 1. Initialize Platform (Self-contained, pluggable)
// ============================================================
        const platform = Platform.getInstance();

// Register APIs
        const apiRegistrations: ApiRegistration[] = [
            // Identity Access Management
            { id: 'iam.user.get', method: 'GET', path: '/users/:id', domain: 'identity_access_management', tenant: true },
            { id: 'iam.user.list', method: 'GET', path: '/users', domain: 'identity_access_management', tenant: true },
            { id: 'iam.user.create', method: 'POST', path: '/users', domain: 'identity_access_management', tenant: true },
            { id: 'iam.user.update', method: 'PUT', path: '/users/:id', domain: 'identity_access_management', tenant: true },
            { id: 'iam.user.delete', method: 'DELETE', path: '/users/:id', domain: 'identity_access_management', tenant: true },
            { id: 'iam.tenant.create', method: 'POST', path: '/tenants', domain: 'identity_access_management', tenant: false },
            { id: 'iam.auth.login', method: 'POST', path: '/auth/login', domain: 'identity_access_management', tenant: false },

            // Authorization Management
            { id: 'authz.role.get', method: 'GET', path: '/roles/:id', domain: 'authorization_management', tenant: true },
            { id: 'authz.role.list', method: 'GET', path: '/roles', domain: 'authorization_management', tenant: true },
            { id: 'authz.permission.check', method: 'POST', path: '/permissions/check', domain: 'authorization_management', tenant: true },
        ];

        platform.registerAPIs(apiRegistrations);

        return platform;
        console.log(`Platform initialized with ${platform.getApiRegistry().list().length} APIs`);

    }

    platformHealth(platform:any)
    {
        // Optional: Health check for platform
        app.get('/platform/health', async (req, res) => {
            const health = await platform.healthCheck();
            res.json({
                status: 'ok',
                domains: health,
                apis: platform.getApiRegistry().list().length
            });
        });
    }

    platformMiddleware(app)
    {
        app.use(platform.apiMiddleware.getHandler());
    }
}
// todo FREEZ the object

const app = express();

const application = new Application();

application.appContext();

const platform = application.platform();

application.platformHealth(platform);

application.platformMiddleware(app);

application.appBeforeMiddleware(app);

await application.runtime();

const context = application.buildContext();

//routes go here
app.use((new AuthRoute(context)).route(context));

app.use((new UserRoute(context)).route(context));

app.use((new ProductRoute(context)).route(context));

app.use((new CheckoutRoute(context)).route());

app.use((new AuditRoute(context)).route());

app.use((new OrderRoute(context)).route());

application.appAfterMiddleware(app);

// ============================================================
// 5. Graceful Shutdown - Close platform connections
// ============================================================
const originalClose = app.listen;
app.listen = function(...args: any[]) {
    const server = originalClose.apply(this, args);

    const shutdown = async (signal: string) => {
        console.log(`\n${signal} received, shutting down...`);

        server.close(async () => {
            // Close platform connections
            await platform.close();
            console.log('✅ Platform connections closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
};

export { app, context };
//# sourceMappingURL=app.js.map