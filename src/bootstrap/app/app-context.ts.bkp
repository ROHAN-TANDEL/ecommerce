import {Kernel} from "../../app/kernel/kernel.js";

export class Context {

    constructor(public readonly kernel : Kernel) {
    }

    connect()
    {
        const ker = this.kernel.connect();

        return {
            log : ker.log.connect(),
            env : ker.env.connect(),
            server : ker.server,
        };
    }
}