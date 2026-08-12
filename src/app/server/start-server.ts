/**
 * Start the server
 */
export class StartServer {
    connect(app, context) {
        return app.listen(context.env.APP_PORT, () => {
            context.logger.info({ server_start_status: "Server Started on port " + context.env.APP_PORT });
            console.info({ server_start_status: "Server Started on port " + context.env.APP_PORT });
        });
    }
}
//# sourceMappingURL=start-server.js.map