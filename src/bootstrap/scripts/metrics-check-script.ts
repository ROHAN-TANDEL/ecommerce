import registryHelper from "../helper/registryHelper.js";

export class MetricsCheckScript {

    context;

    constructor(context: any) {
        this.context = context;
    }

    run() {
        const registryHelp = registryHelper.registry;
        return async (_req: any, res: any) => {
            res.setHeader('Content-Type', registryHelp.contentType);
            res.end(await registryHelp.metrics());
        };
    }
}
//# sourceMappingURL=metrics-check-script.js.map