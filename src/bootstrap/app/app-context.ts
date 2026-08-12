import Kernel from "../../app/kernel/kernel.js";
import InfraKernel from "../../infra/kernel/kernel.js";
import RouteNotFoundCheckMiddleware from "../middleware/route-not-found-check-middleware.js";
import { RuntimeContext } from "../runtime/runtime-context.js";

export class KernelContext {

    appStart() {

        const kernel = new Kernel();
        const start = kernel.start();
        const env = (new start.Env()).connect();
        const log = new start.Log(env);
        const server = start.Server;
        const middleware = kernel.middleware();

        return {
            logger: log.connect(),
            env: env,
            server: server,
            appMiddleware: { before: middleware.before, after: {
                    routeNotFoundCheckMiddleware: RouteNotFoundCheckMiddleware,
                    globalErrorHandlerMiddleware: middleware.after.globalErrorHandlerMiddleware
                } },
        };
    }

    infra() {
        return (new InfraKernel()).connect();
    }

    init() {
        console.info({ context_status: "registering context... " });
        const app = this.appStart();
        const infra = this.infra();
        return { ...app, ...infra };
    }

    runtimeContext(context: any) {
        return (new RuntimeContext(context)).run();
    }
}
//# sourceMappingURL=app-context.js.map