import dotenv from "dotenv";
import {DatabaseError, Pool} from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {validate} from "uuid";
import {createClient} from "redis";

// 1. build a common context
function ContextObject(env:any, db?:any, pool?:any, hash?:any) : any
{
    return {
        env,
        db,
        pool,
        hash
    };
}


// 2. build an env
dotenv.config();

function Env()
{

    return {
        NODE_ENV : process.env.NODE_ENV || "development",
        PG_MASTER_HOST : process.env.PG_MASTER_HOST,
        PG_MASTER_PORT : process.env.PG_MASTER_PORT || "5432",
        PG_MASTER_DATABASE : process.env.PG_MASTER_DATABASE,
        PG_MASTER_SCHEMA : process.env.PG_MASTER_SCHEMA,
        PG_MASTER_USERNAME : process.env.PG_MASTER_USERNAME,
        PG_MASTER_PASSWORD : process.env.PG_MASTER_PASSWORD,
        SALT : process.env.SALT,
        JWT_SECRET : process.env.JWT_SECRET,
        JWT_TTL : process.env.JWT_TTL,
        JWT_REFRESH_SECRET : process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_TTL : process.env.JWT_REFRESH_TTL
    }
}


// 3. database setup
function Database(env:any)
{

    function connect()
    {
        return new Pool({
            host: env.PG_MASTER_HOST,
            port: parseInt(env.PG_MASTER_PORT),
            user: env.PG_MASTER_USERNAME,
            password: env.PG_MASTER_PASSWORD,
            database: env.PG_MASTER_DATABASE
        });
    }

    function disconnect(context:any)
    {
        return context.pool.end();
    }

    return {
        connect,
        disconnect,
    }
}

// 4. password hash
function Pass(env:any)
{
    function encrypt(secret: string)
    {
        return bcrypt.hash(secret, parseInt(env.SALT));
    }

    async function compare(secret:string, password:string) : Promise<boolean>
    {
        return await bcrypt.compare(secret, password);
    }

    return {
        encrypt,
        compare
    }
}

const env = Env();
const hash = Pass(env);
const db = Database(env);
const pool = db.connect();
const context = ContextObject(env, db, pool, hash);


function dbHealth(context:any)
{
    async function health(req: any, res:any)
    {
        try {

            const query = `SELECT 
                pid, 
                user,
                client_addr, 
                state, 
                query, 
                age(clock_timestamp(), query_start) AS duration 
            FROM pg_stat_activity 
            WHERE state != 'idle' 
            ORDER BY duration DESC`;

            const result = await context.pool.query(query);

            return res.json({
                status: "UP",
                active_queries: result.rows
            });

        } catch (error:any) {

            return res.status(500).json({
                status: "UP",
                active_queries: error.message
            });

        }
    }

    return {
        health
    }
}


function User(context:any)
{

    async function getRoles()
    {
        try {
            const query = 'SELECT * FROM master.roles';
            const result = await context.pool.query(query);

            return result.rows;
        } catch (error:any) {
            console.log(error);
            return [];

        }
    }

    async function getRole(role: string)
    {

        try {
            const roles = await getRoles();

            if (!roles) {
                return {
                    status: "failed",
                    message: "user not created, can not get roles"
                };
            }

            let roleDetail = roles.find((roleObj: { name: any; }) => roleObj.name.toLowerCase() === role.toLowerCase());
            if (roleDetail) {

                return {
                    status: "success",
                    data : parseInt(roleDetail.id)
                };

            } else {
                return {
                    status: "failed",
                    message: "Invalid role provided"
                };
            }
        } catch (error) {
            console.log(error);
            return {
                status: "failed",
                message: "role fetch error"
            };
        }
    }

    async function userExists(email: string)
    {
        try {
            const query = `SELECT * FROM master.users WHERE email=$1 AND status='ACTIVE' AND deleted_at IS NOT NULL `;
            const result = await context.pool.query(query, [email]);

            return result.rows;
        } catch (error:any) {
            console.log(error);
            return {
                "status": "failed",
                "message": error.message
            };
        }
    }

    async function insertUser(user:any)
    {

        try {

            console.log(user);
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

            const result = await context.pool.query(query, inputs);

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

    async function createUser(req:any, res:any)
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

            const roles = await getRoles();

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
                user.password_hash = await context.hash.encrypt(user.password);
                delete user.password;
            } else {
                res.status(400).json({
                    "status": "failed",
                    "message": "user not created, invalid password provided"
                });
            }

            const result = await insertUser(user);

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

    async function deleteUser(req:any, res:any)
    {
        try {
            const userId = req.params.id;

            const query = `UPDATE master.users
                           SET deleted_at = NOW()
                           WHERE id = $1
                                AND deleted_at IS NULL
                                RETURNING id, email, deleted_at`;

            const result = await context.pool.query(query, [userId]);

            return res.status(200).json({
                status: "success",
                data: result.rows.at(0)
            });
        } catch (error:any) {
            console.log(error);
            return res.status(400).json({
                status: "failed",
                message: error.message
            })
        }
    }

    async function updateUser(req:any, res:any)
    {
        try {

            const user = req.body;
            const userId = parseInt(req.params.id);

            const role = await getRole(user.role);

            if(role.status === "failed") {
                return res.status(400).json({
                    "status": "failed",
                    message: role.message
                })
            }

            const roleId = role.data;

            const query = `UPDATE master.users 
                                SET 
                                    first_name = COALESCE($1, first_name),
                                    last_name = COALESCE($2, last_name),
                                    role_id = COALESCE($3, role_id),
                                    updated_at = NOW()
                                WHERE id = $4
                                    AND status = 'ACTIVE'
                                    AND deleted_at IS NULL
                                RETURNING id, first_name, last_name, updated_at;
            `;

            const result = await context.pool.query(query,
                [
                    user.first_name,
                    user.last_name,
                    roleId,
                    userId
                ]);


            if (result && result.rowCount && result.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    data: result.rows.at(0)
                });
            }


            return res.status(400).json({
                status: "failed",
                message: "update is invalid for the user"
            });

        } catch (error:any) {

            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: error.message
            })
        }
    }

    async function updateUserStatus(req:any, res:any)
    {
        try {
            const user = req.body;
            const userId = parseInt(req.params.id);

            const statusList = new Set(['active', 'inactive']);

            if (!statusList.has(user?.status.toLowerCase())) {
                return res.status(400).json({
                    status: "failed",
                    message: "invalid status provided"
                })
            }

            const userStatus = user?.status.toUpperCase();
            const query = `UPDATE master.users
                           SET status='${userStatus}'
                           WHERE id = ${userId}
                             AND status!='${userStatus}'
                            RETURNING id, first_name, last_name, status, updated_at;`;

            console.log(query);
            const result = await context.pool.query(query);

            if (result && result.rowCount && result.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    data: result.rows.at(0)
                })
            }

            return res.status(400).json({
                status: "failed",
                message: 'status update failed'
            });
        } catch (error:any) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: error.message
            })
        }
    }

    async function getUsers(req:any, res:any)
    {
        try {
            const filter = req.query;

            let query = `SELECT id, first_name, last_name, email, status, role_id, created_at, updated_at, deleted_at, last_login_at FROM master.users where 1=1 `;

            /** filters added */
            if(filter?.id !== undefined) {
                query +=` AND id = '${filter.id}' `;
            }

            if(filter?.first_name !== undefined) {
                query +=` AND first_name like '%${filter.first_name}%' `;
            }

            if(filter?.last_name !== undefined) {
                query +=` AND first_name like '%${filter.last_name}%' `;
            }

            if(filter?.email !== undefined) {
                query +=` AND first_name like '%${filter.email}%' `;
            }

            if (filter?.role?.toLowerCase() === "admin"  ||
                filter?.role?.toLowerCase() === "user") {

                const role = await getRole(filter.role);

                if(role.status === "failed") {
                    return res.status(400).json({
                        "status": "failed",
                        message: role.message
                    })
                }

                const roleId = role.data;

                query +=` AND role_id = ${roleId} `;
            }


            if (filter?.status?.toLowerCase() === "active"  ||
                filter?.status?.toLowerCase() === "inactive") {

                query +=` AND status = '${filter.status.toUpperCase()}' `;
            }


            if (filter?.deleted !== undefined && !Boolean(filter.deleted)) {
                query +=` AND deleted_at IS NOT NULL `;
            } else if(filter?.deleted !== undefined && Boolean(filter?.deleted)) {
                query +=` AND deleted_at IS NULL `;
            }


            /** Add standard sorting */
            query += ` ORDER BY created_at DESC `;

            const result = await context.pool.query(query);

            return res.status(200).json({
                status: "success",
                data: result.rows
            });

        } catch (error:any) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: error.message
            })
        }
    }

    async function getUser(req:any, res:any)
    {
        const user = await userExists(req.user.email);

        if(!user || user.status === 'failed') {
            return res.status(404).json({
                status: "failed",
                message: "user not found"
            });
        }

        const result = user.at(0);
        delete result.password_hash;

        return res.status(200).json({
            status: "success",
            data: user.at(0)
        });
    }

    return {
        createUser,
        deleteUser,
        updateUser,
        updateUserStatus,
        getUsers,
        userExists,
        getUser
    }
}

function Token(context:any)
{
    function signature(payload:any, secret:any, ttl:any)
    {
        if (payload?.exp) {
            return jwt.sign(payload, secret);
        } else {
            return jwt.sign(payload, secret, {
                expiresIn: ttl
            });
        }
    }

    function verify(signature:string, secret : string)
    {
        return jwt.verify(signature, secret);
    }

    function valid(signature:string, secret : string)
    {
        return jwt.verify(signature, secret, { ignoreExpiration: true });
    }

    function expired(exp:any)
    {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        return currentTimestamp <= exp;
    }

    function refreshToken()
    {
        const secret = context.env.JWT_REFRESH_SECRET;
        const ttl = context.env.JWT_REFRESH_TTL;

        function sign(payload: {any:any;}) {
            return signature(payload, secret, ttl);
        }

        function validate(signature:string) {
            return valid(signature, secret);
        }

        return {
            sign,
            validate,
        }
    }

    function accessToken()
    {
        const secret = context.env.JWT_SECRET;
        const ttl = context.env.JWT_TTL;

        function sign(payload: {any:any;}) {
            return signature(payload, secret, ttl);
        }

        function validate(signature:string) {
            return valid(signature, secret);
        }

        return {
            sign,
            validate,
        }
    }

    function dualToken(payload: {any:any;})
    {
        const refresh = refreshToken().sign(payload);
        const access = accessToken().sign(payload);

        return {
            refresh,
            access
        }
    }

    return {signature, verify, refreshToken, accessToken, dualToken, expired}
}

context.token = Token(context);


function Login(context:any, User: any)
{
    async function validate(req:any, res:any)
    {
        try {
            const login = req.body;

            if (!login || login?.email === undefined || login?.password === undefined) {
                return res.status(400).json({
                    status: "failed",
                    message: "invalid login details"
                });
            }
            const userData = await User.userExists(login.email);

            if (userData?.status === "failed") {
                /** error fetching user details */
                return res.status(400).json({
                    status: "failed",
                    message: "invalid login details"
                });
            }

            const validUser = userData.at(0);

            if (validUser?.password_hash === undefined || !await context.hash.compare(login.password, validUser.password_hash)) {
                return res.status(400).json({
                    status: "failed",
                    message: "invalid login details"
                });
            }

            delete validUser.password_hash;

            const token = await context.token.dualToken(validUser);

            const refresh = await context.refreshToken.store(token.refresh, validUser.id);

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

    return {validate}
}

function RefreshToken(context:any, User: any)
{
    async function store(refreshToken:any, userId:any, exp?:any)
    {
        const client = await context.pool.connect();

        try {
            await client.query('BEGIN');

            const ttlSeconds = context.env.JWT_REFRESH_TTL;

            const expiresAt = new Date(exp ?? Date.now() + ttlSeconds * 1000);

            await client.query(
                `SELECT id FROM master.users WHERE id = $1 FOR UPDATE NOWAIT`,
                [userId]
            );

            await pool.query('DELETE FROM master.refresh_tokens WHERE user_id = $1', [userId]);

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

    async function getToken(req:any, res:any)
    {

        try {
            const token = req.body;

            const payload = await context.token.refreshToken().validate(token.token);

            const expire = context.token.expired(payload.exp);

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

            const result = await context.pool.query(query, [userId]);

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

                await context.pool.query(query, [userId]);

                return res.status(401).json({
                    status: "failed",
                    message: "incorrect token"
                })
            }

            /** provide the new token as is with access token or rotate the refresh token too*/

            const validUser = await User.userExists(payload.email);

            if (validUser?.status === "failed") {

                return res.status(400).json({
                    status: "failed",
                    message: "invalid details"
                });
            }

            /**sign refresh token with same expiry - rotate refresh token*/
            const userDetail = validUser.at(0);

            delete userDetail.password_hash;

            const accessToken = await context.token.accessToken().sign(userDetail);

            userDetail.exp = payload.exp;
            const refreshToken = await context.token.accessToken().sign(userDetail);

            /**store fresh token */
            const storeToken = await store(refreshToken, userId, userDetail.exp);

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

    return {store, getToken}
}

function Auth(context:any)
{
    function validate(req:any, res:any, next:any)
    {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                status: "failed",
                message: "incorrect authorization"
            });
        }

        const [ type, token ] = authorization.split(" ");

        if ( type !== "Bearer" ) {
            return res.status(401).json({
                status: "failed",
                message: "invalid authorization"
            })
        }

        req.user = context.token.accessToken().validate(token);

        next();

    }

    return { validate };
}


function Redis(context:any)
{
    async function connect()
    {
        const connection = {
            url: "redis://admin:adminpass@localhost:6379"
        };

        const redisClient = createClient(connection);

        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        return await redisClient.connect();

    }

    function set()
    {

    }

    function get()
    {

    }

    return {connect, set, get}
}

context.redis = Redis(context);
context.client = context.redis.connect();

context.refreshToken = RefreshToken(context, User(context));
context.auth = Auth(context);
module.exports = function ecomRoutes(app: any)
{
    app.get('/health', dbHealth(context).health);
    app.post('/user', User(context).createUser);
    app.post('/register', User(context).createUser);
    app.delete('/user/:id', User(context).deleteUser);
    app.post('/user/:id', User(context).updateUser);
    app.get('/me', context.auth.validate, User(context).getUser);
    app.post('/user/:id/status', User(context).updateUserStatus);
    app.get('/users-list', User(context).getUsers);
    app.post('/login', Login(context, User(context)).validate);
    app.post('/refresh-token', RefreshToken(context, User(context)).getToken);
    app.post('/logout', Login(context, User(context)).validate);

};


