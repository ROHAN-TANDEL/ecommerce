export class StopServer {
    context;

    constructor(context: any) {
        this.context = context;
    }

    // Stores all future dependencies dynamically
    tasks = [];
    isShuttingDown = false;

    /**
     * Register a new component that needs a graceful exit.
     * Example: stopServer.register('Database', () => db.disconnect());
     */
    register(name: any, cleanup: any) {
        this.tasks.push({ name, cleanup });
        return this; // Allows method chaining
    }

    /**
     * Initializes the signal listeners
     */
    init(){
        this.context.logger.info({ server_stop_status: "registering graceful shutdown... " });
        console.info({ server_stop_status: "registering graceful shutdown... " });
        const context = this.context;
        const stopper = (server: any, logger: any) => {
            server.requestTimeout = context.env.HTTP_REQUEST_TIMEOUT_MS;
            server.headersTimeout = context.env.HTTP_HEADERS_TIMEOUT_MS;
            server.keepAliveTimeout = context.env.HTTP_KEEP_ALIVE_TIMEOUT_MS;
            const handleSignal = (signal: any) => {
                if (this.isShuttingDown) {
                    return;
                }
                this.isShuttingDown = true;
                logger.info(signal);
                logger.info('graceful shutdown started');
                logger.info(`Received ${signal}. Starting dynamic shutdown sequencer...`);
                this.shutdown(server);
            };
            process.on("SIGINT", () => handleSignal("SIGINT"));
            process.on("SIGTERM", () => handleSignal("SIGTERM"));
            process.once('unhandledRejection', (error) => {
                context.logger.fatal({ err: error }, 'unhandled promise rejection');
                this.shutdown(server);
            });
            process.once('uncaughtException', (error) => {
                context.logger.fatal({ err: error }, 'uncaught exception');
                this.shutdown(server);
            });
        };
        return { stopper };
    }

    /**
     * Executes the actual shutdown sequence
     */

    shutdown(server: any) {
        // Force exit safety timeout (e.g., 10 seconds)
        const forceExit = setTimeout(() => {
            this.context.logger.error("Shutdown timed out! Forcefully terminating.");
            process.exit(1);
        }, 10000);
        forceExit.unref();
        try {
            if (typeof server === "string") {
                throw new Error(server);
            }
            // 1. Stop HTTP server first so no new network requests arrive
            server.close(async () => {
                this.context.logger.info("HTTP server closed. Processing registered cleanup tasks...");
                // 2. Iterate through all dynamically registered resources
                for (const task of this.tasks) {
                    try {
                        this.context.logger.info(`Cleaning up: ${task.name}...`);
                        await task.cleanup();
                        this.context.logger.info(`Successfully closed: ${task.name}`);
                    }
                    catch (error) {
                        this.context.logger.error(`Failed to close ${task.name}: ${error}`);
                    }
                }
                this.context.logger.info("Graceful Shutdown Complete.");
                clearTimeout(forceExit);
                process.exit(0);
            });
        }
        catch (error) {
            this.context.logger.error({ err: error });
            this.context.logger.error('graceful shutdown failed');
            console.info('graceful shutdown failed');
            this.context.logger.error('graceful shutdown timed out cleared');
            console.error('graceful shutdown timed out cleared');
            clearTimeout(forceExit);
            process.exitCode = 1;
        }
    }
}
//# sourceMappingURL=stop-server.js.map