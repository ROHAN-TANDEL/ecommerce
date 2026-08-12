import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
const uuidv4 = () => randomUUID();
export default class Auth {

    context;

    constructor(context: any) {
        this.context = context;
    }

    encrypt(secret: any) {
        return bcrypt.hash(secret, parseInt(this.context.env.SALT));
    }

    async compare(secret: any, password: any) {
        return await bcrypt.compare(secret, password);
    }

    signature(payload: any, secret: any, ttl: any) {
        payload.jti = uuidv4();
        if (payload?.exp) {
            return jwt.sign(payload, secret);
        }
        else {
            console.log("logged in token", payload, secret, ttl);
            return jwt.sign(payload, secret, {
                expiresIn: ttl
            });
        }
    }

    verify(signature: any, secret: any) {
        return jwt.verify(signature, secret);
    }

    valid(signature: any, secret: any) {
        return jwt.verify(signature, secret, { ignoreExpiration: true });
    }

    expired(exp: any) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        console.log(currentTimestamp, exp, exp - currentTimestamp);
        return currentTimestamp > exp;
    }

    refreshToken() {
        const secret = this.context.env.JWT_REFRESH_SECRET;
        const ttl = this.context.env.JWT_REFRESH_TTL;
        const object = this;
        function sign(payload: any) {
            return object.signature(payload, secret, ttl);
        }
        function validate(signature: any) {
            return object.valid(signature, secret);
        }
        return {
            sign,
            validate,
        };
    }

    accessToken() {
        const secret = this.context.env.JWT_SECRET;
        const ttl = this.context.env.JWT_TTL;
        const object = this;
        function sign(payload: any) {
            return object.signature(payload, secret, ttl);
        }
        function validate(signature: any) {
            return object.valid(signature, secret);
        }
        return {
            sign,
            validate,
        };
    }

    dualToken(payload: any) {
        const refresh = this.refreshToken().sign(payload);
        const access = this.accessToken().sign(payload);
        return {
            refresh,
            access
        };
    }
}
//# sourceMappingURL=auth.js.map