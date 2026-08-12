import { app, context } from "./app.js";
import pino from "pino";
async function start() {
    try {
        console.log({ server_status: "Starting server..." });
        const server = (new context.server.start()).connect(app, context);
        const stop = new context.server.stop(context);
        // stop.register(name, cleanup);
        (stop.init(server, context.logger)).stopper(server, context.logger);
    }
    catch (error) {
        console.log({ server_error: "failed to start server..." });
        console.log({ server_error: error });
        process.exit(1);
    }
}
// start()returns a Promise.
// We're intentionally saying:
// "Start the application, and we are intentionally not awaiting the returned Promise here."
// It also keeps TypeScript and ESLint happy by making it explicit that the returned promise is intentionally ignored at the top level.
void start();
//# sourceMappingURL=server.js.map