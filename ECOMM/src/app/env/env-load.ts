import dotenv from "dotenv";
import { EnvValidator } from "./env-validator.js";
import { EnvKeys } from "./env-keys.js";
import z from "zod";

export class EnvLoad {
    envValidator;
    envKeys;

    constructor() {
        this.envValidator = new EnvValidator();
        this.envKeys = new EnvKeys();
    }

    connect() {
        console.log({ environment_status: "loading env variables..." });
        dotenv.config();
        return this.process();
    }

    process() {
        const env = this.parse();
        return this.envKeys.keyBind(env);
    }

    parse() {
        const envData = z.object(this.envValidator.validate()).safeParse(process.env);
        if (!envData.success) {
            throw new Error(envData.error.message);
        }
        return envData.data;
    }
}
//# sourceMappingURL=env-load.js.map