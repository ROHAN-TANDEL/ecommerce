export default class AuthController {
    constructor(private readonly context: any) {
    }

    async ping(req:any, res:any): Promise<any>
    {
        return res.status(200).send({
            status: "OK",
            data : "PONG"
        });
    }

    async getRoles()
    {
        try {
            const query = 'SELECT * FROM master.roles';
            const result = await this.context.client.query(query);

            return result.rows;
        } catch (error:any) {
            console.log(error);
            return [];

        }
    }

    async insertUser(user:any)
    {
        try {

            const query = `INSERT INTO master.users (first_name,
                                              last_name,
                                              email,
                                              password_hash,
                                              role_id,
                                              status)
                           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;

            const inputs = [
                user.first_name,
                user.last_name,
                user.email,
                user.password_hash,
                user.role_id,
                user.status.toUpperCase(),
            ];

            const result = await this.context.client.query(query, inputs);

            return result.rows;

        } catch (error:any) {
            if (error.code === "23505") {
                return {
                    "status": "error",
                    "message" : "user already exists"
                };
            }
            console.log(error);
            throw error;
        }

    }

    public register = async (req:any, res:any): Promise<any> =>
    {
        try {
            const user = req.body;

            user.status = 'ACTIVE';

            if (!user) {
                res.status(400).json({
                    "status": "failed",
                    "message": "user not created, invalid data"
                });
            }

            const roles = await this.getRoles();

            if (!roles) {
                res.status(400).json({
                    "status": "failed",
                    "message": "user not created, can not get roles"
                });
            }

            if (roles.some((roleObj: { name: any; }) => roleObj.name === user.role)) {

                const foundRole = roles.find((r: { name: string; id: string }) =>
                    r.name.toLowerCase() === 'admin' || r.name.toLowerCase() === 'user'
                );

                user.role_id = parseInt(foundRole.id);

                delete user.role;
            } else {
                res.status(400).json({
                    "status": "failed",
                    "message": "user not created, invalid role provided"
                });
            }

            if (user?.password !== undefined) {
                user.password_hash = await this.context.auth.encrypt(user.password);
                delete user.password;
            } else {
                res.status(400).json({
                    "status": "failed",
                    "message": "user not created, invalid password provided"
                });
            }

            const result = await this.insertUser(user);

            if (result && result.status === "error" ) {
                return res.status(400).json({
                    "status": "failed",
                    "message": result.message
                });
            }

            if (!result || result.length > 0) {
                return res.status(201).json({
                    status: "success",
                    data: result.at(0)
                });
            }

        } catch (error:any) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: error.message
            });
        }
    }

    public logout = async(req:any, res:any) : Promise<void> =>
    {
        try {
            const {jti, exp, id} = req.user;


            const currentTimestamp = Math.floor(Date.now() / 1000);
            const secondsLeft = exp - currentTimestamp;

            if (secondsLeft > 0) {
                const blackListKey = this.context.env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY;
                await this.context.redis.setEx(`${blackListKey}:${jti}`, secondsLeft, 'true');
            }

            /** it will make the remaining valid access tokens the last if they are expired then relogin
             const refreshToken = await context.pool.query('DELETE FROM master.refresh_tokens WHERE user_id = $1', [id]);
             */
            return res.status(200).json({
                status: "success",
                message: "logout completed"
            });

        } catch (error:any) {

            console.error("logout error:", error);

            return res.status(401).json({
                status: "failed",
                message: "logout failed"
            });
        }
    }

    async userExists(email: string)
    {
        try {
            const q = `SELECT * FROM master.users WHERE email=$1 AND status='ACTIVE' AND deleted_at IS NULL `;
            const result = await this.context.client.query(q, [email]);

            return result.rows;
        } catch (error:any) {
            console.log(error);
            return {
                "status": "failed",
                "message": error.message
            };
        }
    }

    public refreshToken = async(req:any, res:any) : Promise<void> =>
    {
        try {
            const token = req.body;

            const payload = await this.context.auth.refreshToken().validate(token.token);

            const expire = this.context.auth.expired(payload.exp);

            if (expire) {
                return res.status(401).json({
                    status: 'failed',
                    message: "relogin"
                });
            }

            const userId = payload.id;

            const query = `SELECT * FROM master.refresh_tokens 
                             WHERE user_id = $1
                               AND revoked_at IS NULL 
                             ORDER BY created_at DESC`;

            const result = await this.context.client.query(query, [userId]);

            /**valid token but it is not in records */
            if (!result || result?.rows?.at(0)?.token === undefined) {
                return res.status(401).json({
                    status: "failed",
                    message: "please relogin, token issue"
                });
            }

            /**valid token but do not match with the record */
            if (token.token !== result.rows?.at(0)?.token) {
                /** clean all the token */
                const query = `DELETE FROM master.refresh_tokens WHERE user_id = $1`;

                await this.context.client.query(query, [userId]);

                return res.status(401).json({
                    status: "failed",
                    message: "incorrect token"
                })
            }

            /** provide the new token as is with access token or rotate the refresh token too*/

            const validUser = await this.userExists(payload.email);

            if (validUser?.status === "failed") {

                return res.status(400).json({
                    status: "failed",
                    message: "invalid details"
                });
            }

            /**sign refresh token with same expiry - rotate refresh token*/
            const userDetail = validUser.at(0);

            delete userDetail.password_hash;

            const accessToken = await this.context.auth.accessToken().sign(userDetail);

            userDetail.exp = payload.exp;
            const refreshToken = await this.context.auth.accessToken().sign(userDetail);

            /**store fresh token */
            const storeToken = await this.store(refreshToken, userId, userDetail.exp);

            return res.status(200).json({
                status: "success",
                data: {
                    accessToken,
                    userDetail,
                    refreshToken
                }
            });
        } catch (error:any) {
            console.error("Database store error:", error);
            return res.status(401).json({
                status: "failed",
                message: "incorrect token"
            });
        }

    }

    async store(refreshToken:any, userId:any, exp?:any)
    {
        const client = await this.context.client.connect();

        try {
            await client.query('BEGIN');

            const ttlSeconds = this.context.env.JWT_REFRESH_TTL;

            const expiresAt = new Date(exp ?? Date.now() + ttlSeconds * 1000);

            await client.query(
                `SELECT id FROM master.users WHERE id = $1 FOR UPDATE NOWAIT`,
                [userId]
            );

            await client.query('DELETE FROM master.refresh_tokens WHERE user_id = $1', [userId]);

            const insertQuery = `
                INSERT INTO master.refresh_tokens (user_id, token, expires_at) 
                VALUES ($1, $2, $3)
            `;

            await client.query(insertQuery, [userId, refreshToken, expiresAt]);

            await client.query('COMMIT');


            return {
                status: "success",
                message : "refresh token persisted"
            };

        } catch (error:any) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }

            console.error("Database store error:", error);

            if (error.code === '55P03') {
                return {
                    status: "failed",
                    message: "Too many login attempts. Please wait a moment and try again."
                };
            }

            return {
                status: "failed",
                message: "An internal database error occurred."
            };
        } finally {
            client.release();
        }
    }

    public login = async(req:any, res:any) : Promise<void> =>
    {
        try {
            const login = req.body;

            if (!login || login?.email === undefined || login?.password === undefined) {
                return res.status(400).json({
                    status: "failed",
                    message: "invalid login details"
                });
            }
            const userData = await this.userExists(login.email);

            if (userData?.status === "failed") {
                /** error fetching user details */
                return res.status(400).json({
                    status: "failed",
                    message: "invalid login details"
                });
            }

            const validUser = userData.at(0);

            if (validUser?.password_hash === undefined || !await this.context.auth.compare(login.password, validUser.password_hash)) {
                return res.status(400).json({
                    status: "failed",
                    message: "invalid login details"
                });
            }

            delete validUser.password_hash;

            const token = await this.context.auth.dualToken(validUser);

            const refresh = await this.store(token.refresh, validUser.id);

            if(refresh?.status !== "success") {

                return res.status(400).json({
                    status: "failed",
                    message: "internal error, invalid response"
                })
            }

            return res.status(200).json({
                status: "success",
                data: validUser,
                token: token
            });

        } catch (error:any) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: "login failed"
            })
        }
    }

}