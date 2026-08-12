import { Logs } from "../logs/pino-logs.js";
import { EnvLoad } from "../env/env-load.js";
import { StartServer } from "../server/start-server.js";
import { StopServer } from "../server/stop-server.js";
import { HelmetMiddleware } from "../middlewares/helmet-middleware.js";
import { CorsRegisterMiddleWare } from "../middlewares/cors-register-middleware.js";
import { RateLimitRegisterMiddleware } from "../middlewares/rate-limit-register-middleware.js";
import { RequestLoggerMiddleware } from "../middlewares/request-logger-middleware.js";
import { RequestIdMiddleware } from "../middlewares/request-id-middleware.js";
import { ExpressJsonMiddleware } from "../middlewares/express-json-middleware.js";
import { UrlEncodedMiddleware } from "../middlewares/url-encoded-middleware.js";
import { CookieMiddleware } from "../middlewares/cookie-parser-middleware.js";
import { ExpressStaticMiddleware } from "../middlewares/express-static-middleware.js";
import { GlobalErrorHandlerMiddleware } from "../middlewares/global-error-handler-middleware.js";
export default class Kernel {

    start() {
        return {
            Log: Logs,
            Env: EnvLoad,
            Server: { start: StartServer, stop: StopServer },
        };
    }

    middleware() {
        return {
            before: {
                helmetMiddleware: HelmetMiddleware,
                corsMiddleware: CorsRegisterMiddleWare,
                rateLimiterMiddleware: RateLimitRegisterMiddleware,
                requestLoggerMiddleware: RequestLoggerMiddleware,
                requestIdMiddleware: RequestIdMiddleware,
                expressJsonMiddleware: ExpressJsonMiddleware,
                urlEncodedMiddleware: UrlEncodedMiddleware,
                cookieMiddleware: CookieMiddleware,
                expressStaticMiddleware: ExpressStaticMiddleware
            },
            after: {
                globalErrorHandlerMiddleware: GlobalErrorHandlerMiddleware
            }
        };
    }
}
//# sourceMappingURL=kernel.js.map