import Kernel from "../../infra/kernel/kernel.js";

export class RuntimeContext {

    context;

    constructor(context: any) {
        this.context = context;
        this.context = context;
    }

    run() {
        const kernel = new Kernel();
        return kernel.connect();
        // additional runtime scripts if needed like db checks, health checks and all those, ping and pong
    }
}
//# sourceMappingURL=runtime-context.js.map