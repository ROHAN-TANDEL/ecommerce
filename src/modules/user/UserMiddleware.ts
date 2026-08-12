export default class AuthMiddleware {
    constructor(private readonly context:any) {
    }

    public auth = async(req:any, res:any, next:any)=>
    {
        try {
            const authorization = req.headers.authorization;

            if (!authorization) {
                return res.status(401).json({
                    status: "failed",
                    message: "incorrect authorization"
                });
            }

            const [type, token] = authorization.split(" ");

            if (type !== "Bearer") {
                return res.status(401).json({
                    status: "failed",
                    message: "invalid authorization"
                });
            }

            const payload = this.context.auth.accessToken().validate(token);

            const expired = this.context.auth.expired(payload.exp);

            if (expired) {
                return res.status(401).json({
                    status: "failed",
                    message: "invalid authorization"
                });
            }

            if (!payload) {
                return res.status(401).json({
                    status: "failed",
                    message: "invalid authorization"
                });
            }

            const blacklist = this.context.env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY;

            const isBlacklisted = await this.context.redis.get(`${blacklist}:${payload.jti}`);

            if (isBlacklisted) {
                return res.status(401).json({
                    status: "failed",
                    message: "Token has been revoked by user"
                });
            }

            req.user = payload;

            next();
        } catch (error:any) {

            console.error("Database store error:", error);

            return res.status(401).json({
                status: "failed",
                message: "Token validation failed"
            });

        }

    }

    public validate = async(req:any, res:any, next : any) : Promise<void> =>
    {
        try {
            const authorization = req.headers.authorization;

            if (!authorization) {
                return res.status(401).json({
                    status: "failed",
                    message: "incorrect authorization"
                });
            }

            const [type, token] = authorization.split(" ");

            if (type !== "Bearer") {
                return res.status(401).json({
                    status: "failed",
                    message: "invalid authorization"
                });
            }

            const payload = this.context.auth.accessToken().validate(token);

            const expired = this.context.auth.expired(payload.exp);

            if (expired) {
                return res.status(401).json({
                    status: "failed",
                    message: "invalid authorization"
                });
            }

            if (!payload) {
                return res.status(401).json({
                    status: "failed",
                    message: "invalid authorization"
                });
            }

            const blacklist = this.context.env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY;

            const isBlacklisted = await this.context.redis.get(`${blacklist}:${payload.jti}`);

            if (isBlacklisted) {
                return res.status(401).json({
                    status: "failed",
                    message: "Token has been revoked by user"
                });
            }

            req.user = payload;

            next();
        } catch (error:any) {

            console.error("Database store error:", error);

            return res.status(401).json({
                status: "failed",
                message: "Token validation failed"
            });

        }

    }
}