import dotenv from "dotenv";
import {Pool} from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";
import {createClient} from "redis";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
        JWT_REFRESH_TTL : process.env.JWT_REFRESH_TTL,
        AUTH_TOKEN_BLOCKLIST_REDIS_KEY : process.env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY,
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
        payload.jti = uuidv4();

        if (payload?.exp) {
            return jwt.sign(payload, secret);
        } else {
            console.log("logged in token", payload, secret, ttl);
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
        console.log("current date :", currentTimestamp);
        return currentTimestamp > exp;
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
    async function validate(req:any, res:any, next:any)
    {
        try {
            const authorization = req.headers.authorization;
            console.log(authorization);
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

            const payload = context.token.accessToken().validate(token);

            console.log('token validate:',payload);

            const expired = context.token.expired(payload.exp);

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

            const blacklist = context.env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY;

            const isBlacklisted = await context.redisClient.get(`${blacklist}:${payload.jti}`);

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

    async function logout(req:any, res:any)
    {
        try {
            const {jti, exp, id} = req.user;


            const currentTimestamp = Math.floor(Date.now() / 1000);
            const secondsLeft = exp - currentTimestamp;

            if (secondsLeft > 0) {
                const blackListKey = context.env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY;
                await context.redisClient.setEx(`${blackListKey}:${jti}`, secondsLeft, 'true');
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

    return { validate, logout };
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

    return {connect}
}


function Paginate(context:any)
{


    function offset(req:any)
    {
        const parsed = parseInt(req?.query?.offset, 10);
        return isNaN(parsed) ? 10 : parsed;
    }


    function limit(req:any)
    {
        const parsed = parseInt(req?.query?.limit, 10);
        return isNaN(parsed) ? 10 : parsed;
    }

    function cursor(req:any)
    {
        return parseInt(req?.query?.cursor ?? 0, 10);
    }

    function cursorPage(req:any)
    {

        const queryInputs : any[] = [];

        let finalQuery = '';

        if(req.query?.cursor) {
            finalQuery = finalQuery + ` WHERE id < $1`;
            queryInputs.push(cursor(req));
        }

        finalQuery = finalQuery + ` ORDER BY id DESC `;

        if(req.query?.limit) {
            finalQuery = finalQuery + ` LIMIT  $${queryInputs.length + 1} `;
            queryInputs.push(limit(req));
        }


        return {queryInputs, finalQuery}

    }



    function offsetPage(req:any, totalCount:any, inputCount:any=0)
    {

        let finalQuery = '';

        const queryInputs = [];

        finalQuery = finalQuery + ` ORDER BY id ASC `;

        const {offsetNo, limitNo, next, prev, pageNo} = offsetLimitPage(req, totalCount);

        finalQuery = finalQuery + ` OFFSET  $${inputCount + queryInputs.length + 1} `;
        queryInputs.push(offsetNo);

        finalQuery = finalQuery + ` LIMIT  $${inputCount + queryInputs.length + 1} `;
        queryInputs.push(limitNo);

        const totalPages = Math.ceil(totalCount / limitNo);
        return {queryInputs, finalQuery, next, prev, pageNo, totalPages};

    }

    function nextPage(req:any)
    {
        return cursor(req) + limit(req);
    }

    function prevPage(req:any)
    {
        let length = cursor(req) - limit(req);
        if(length < 1) {
            return cursor(req) - limit(req);
        }
    }


    function offsetLimitPage(req:any, totalCount:any)
    {
        let limitNo = 10;
        let pageNo = 1;
        let offsetNo = 0;

        if(req.query?.limit) {
            const limit = parseInt(req.query.limit, 10);
            limitNo = isNaN(limit) ? 10 : limit;

            if(limitNo < 1 || limitNo > 5) {
                limitNo = 1;
            }
        }

        if(req.query?.page) {
            const page = parseInt(req.query.page, 10);
            pageNo = isNaN(page) ? 20 : page;

            if(pageNo > Math.ceil(totalCount/limitNo)) {
                pageNo = 1;
            }
            if (pageNo < 1) {
                pageNo = 1;
            }
        }


        if(pageNo) {
            /** * offset = 10 * limit = 2 * page = 6 * * (6 - 1) * 2 = offset * * page 10 * * (10 - 1) * 2 = 18 * */
            offsetNo = (pageNo - 1) * limitNo;
        }

        let  next = pageNo + 1;

        console.log(pageNo,totalCount/limitNo, next)
        if ((pageNo + 1) > Math.ceil(totalCount/limitNo)) {
            next = 0;
        }

        let  prev = pageNo - 1;

        if ((pageNo - 1) < 1) {
            prev = 0;
        }

        if (prev - 1 > Math.ceil(totalCount/limitNo)) {
            prev = Math.ceil(totalCount/limitNo);
        }

        return {offsetNo, limitNo, next, prev, pageNo};
    }


    return {cursorPage, offsetPage};

}

function Product(context:any)
{

    async function productCount(partQuery?:any, queryInput?:any)
    {
        try {
            let query = 'SELECT COUNT(*) FROM master.products ';

            if (partQuery) {
                query += partQuery;
            }

            const result = await context.pool.query(query, queryInput);

            if (result.rowCount === 0) {
                return {
                    "status": "success",
                    data : {
                        count : result.rowCount,
                    }
                };
            }

            return {
                "status": "success",
                data : {
                    count : result?.rows?.at(0)?.count,
                }
            };
        } catch (error : any) {
            console.error("Product count failed:", error);
            return {
                "status": "failed",
                message: "Product count failed:" + error.message,
            }
        }
    }

    async function products(req:any, res:any)
    {
        try {

            let query = ` SELECT * FROM master.products `;
            let inputCount = 0;
            const inputs = [];
            let partQuery = '';
            /**filters and sorting */
            if(req.query?.search) {
                // sanitize for SQL injection
                partQuery = ` WHERE name ILIKE '%' || $1 || '%' `;
                query = query + partQuery;
                inputCount = 1;
                inputs.push(req.query?.search);

            }

            const totalCount = await productCount(partQuery, inputs);

            if(totalCount.status === "failed") {
                return res.status(400).json({
                    status : "failed",
                    message: "Product count failed:",
                });
            }

            const productsCount = totalCount?.data?.count;


            const {queryInputs, finalQuery, next, prev, pageNo, totalPages} = context.paginate.offsetPage(req, productsCount, inputCount);

            query = query + finalQuery;

            console.log(query);
            const result = await context.pool.query(query, [...inputs, ...queryInputs]);

            if(result.rows.length > 0) {

                return res.status(200).json({
                    status: "success",
                    data:
                        {
                            items: result.rows,
                            nextPage : next,
                            prevPage : prev,
                            currentPage : pageNo,
                            totalPages : totalPages
                        }
                });

            }

            return res.status(200).json({
                status: "success",
                data: {
                    items: [],
                    nextPage: next,
                    prevPage: prev,
                    currentPage : pageNo,
                    totalPages : totalPages
                }
            });

        } catch (error:any) {

            console.error("Product error:", error);

            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }


    async function product(req:any, res:any)
    {
        try {

            const id = req.params.id;

            const cacheKey = `get-product:${id}`;

            const cachedProduct = await context.redisClient.get(cacheKey);
            if (cachedProduct) {
                return res.json({ status: "success", data: JSON.parse(cachedProduct) });
            }


            const query = `SELECT * FROM master.products 
                            WHERE id=$1 AND deleted_at IS NULL`;

            const result = await context.pool.query(query, [id]);

            if(result.rowCount > 0) {
                console.log("from db");
                await context.redisClient.setEx(cacheKey, 30, JSON.stringify(result.rows));

                return res.status(200).json({
                    status: "success",
                    data: result.rows
                });

            }

            await context.redisClient.setEx(cacheKey, 30, JSON.stringify(product));

            return res.status(200).json({
                status: "success",
                data: []
            });

        } catch (error:any) {

            console.error("Product error:", error);

            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }


    async function updateProduct(res:any, req:any)
    {
        try {
            const id = req.params.id;

            const data = req.body;

            const query = `UPDATE master.products SET 
                            sku = COALESCE($1, sku),
                            name = COALESCE($2, name),
                            description = COALESCE($3, description),
                            price = COALESCE($4, price),
                            stock_quantity = COALESCE($5, stock_quantity),
                            status = COALESCE($6, status),
                            version = COALESCE($7, version)
                            
                            WHERE id=$8 and version = $9 AND deleted_at IS NOT NULL`;`
                           `;

            const input = [
                data?.sku,
                data?.name,
                data?.description,
                data?.price,
                data?.stock_quantity,
                data?.status,
                data?.version + 1,
                id
            ];

            const result = await context.pool.query(query, input);

            if(result.rowCount > 0) {
                const cacheKey = `get-product:${id}`;
                await context.redisClient.del(cacheKey);
                return res.status(200).json({
                    status: "success",
                    data: result.rowCount
                });

            }
        } catch (error:any) {

            console.error("Product error:", error);

            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }

    async function patchProduct(req:any, res:any)
    {
        const id = req.params.id;
        const payload = req.body;

        const keys = Object.keys(payload);
        if (keys.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "No fields provided for update"
            });
        }

        const queryParts = keys.map((key, index) => `${key} = $${index + 1}`);

        let query = `UPDATE master.products SET ${queryParts.join(', ')} `;

        const idPosition = keys.length + 1;
        query += `WHERE id = $${idPosition}`;

        const values = [...Object.values(payload), id];

    }

    async function deleteProduct(res:any, req:any)
    {
        try {
            const id = req.params.id;

            const query = `UPDATE master.products SET deleted_at=NOW() WHERE id=$$1`;

            const result = await context.pool.query(query, [id]);

            if (result.rowCount > 0) {
                const cacheKey = `get-product:${id}`;
                await context.redisClient.del(cacheKey);
                return res.status(200).json({
                    status: "success",
                    data: {id: id}
                })
            }
        } catch (error:any) {
            console.error("Product error:", error);
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }

    return {products, product, updateProduct, patchProduct, deleteProduct };
}


function Cart(context:any)
{
    async function getCart(req:any, res:any) {
        try {
            const userId = req.user.id;
            const query = `SELECT *, ci.unit_price * ci.quantity AS subtotal,
                                  SUM(ci.unit_price * ci.quantity) OVER() AS overall_sum_total
            FROM master.carts AS ca

                            JOIN master.cart_items as ci 
                            ON ca.id = ci.cart_id
                            
                            left JOIN master.products as pr 
                            ON ci.product_id = pr.id
                            
                            WHERE user_id = $1
                            AND pr.status = $2
                            ORDER BY ci.updated_at ASC
                        `;
            const result = await context.pool.query(query, [userId, 'ACTIVE']);

            if (result.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    data: {
                        "items": result.rows,
                        "subtotal":result.rows.at(0).overall_sum_total,
                        "totalItems" : result.rowCount
                    }
                });
            }

            return res.status(200).json({
                status: "success",
                data: []
            });

        } catch (error:any) {
                console.log(error.message);
                return res.status(400).json({
                    status: "error",
                    message: error.message
                })
        }
    }

    async function addItem(req:any, res:any)
    {
        const userId = req.user.id;
        const {productId, quantity} = req.body;

        // check product exists
        const productQuery = `SELECT id, name, status, stock_quantity, price  FROM master.products WHERE id=$1 AND deleted_at IS NULL LIMIT 1`;
        const productResult = await context.pool.query(productQuery, [productId]);

        const product = productResult.rowCount > 0;

        if(!product) {
            return res.status(404).json({
                "status": "failed",
                message: "Product not found"
            });
        }

        if(productResult.rows.at(0).status !== "ACTIVE") {
            return res.status(404).json({
                "status": "failed",
                message: "Product is unavailable"
            });
        }

        // check cart exists
        const cartQuery = `SELECT id FROM master.carts WHERE status=$1 AND user_id = $2 LIMIT 1`;
        let cartResult = await context.pool.query(cartQuery, ['ACTIVE' , userId]);

        let cartCheck = cartResult.rowCount > 0;

        if (!cartCheck) {
            const cartQuery = `INSERT INTO master.carts (user_id) VALUES($1) RETURNING id`;
            cartResult = await context.pool.query(cartQuery, [userId]);
            let cart = cartResult.rowCount > 0;

            if(!cart) {
                return res.status(404).json({
                    "status": "failed",
                    "message": "failed to add cart"
                });
            }
        }

        if (!cartCheck) {

            const cartItem = 'INSERT INTO master.cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *';

            const cartItemRes = await context.pool.query(cartItem, [cartResult.rows.at(0).id, productResult.rows.at(0).id, quantity, productResult.rows.at(0).price]);
            if (cartItemRes.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    message: `item ${productResult.rows.at(0).name} added by ${quantity}`
                });
            }

            return res.status(400).json({
                status: "success",
                message: `failed to add ${productResult.rows.at(0).name} added by ${quantity}`
            });
        }

        const cartItem = 'UPDATE master.cart_items SET quantity = quantity + $1 WHERE product_id = $2 AND cart_id=$3 RETURNING *';
        const cartItemRes = await context.pool.query(cartItem, [quantity, productResult.rows.at(0).id, cartResult.rows.at(0).id]);
        console.log([[quantity, productResult.rows.at(0).id, cartResult.rows.at(0).id]], cartItemRes);
        if (cartItemRes.rowCount > 0) {
            return res.status(200).json({
                status: "success",
                message: `item ${productResult.rows.at(0).name} quantity updated by ${quantity}`
            });
        }


        const cartIte = 'INSERT INTO master.cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *';

        const cartItemRe = await context.pool.query(cartIte, [cartResult.rows.at(0).id, productResult.rows.at(0).id, quantity, productResult.rows.at(0).price]);
        if (cartItemRe.rowCount > 0) {
            return res.status(200).json({
                status: "success",
                message: `item ${productResult.rows.at(0).name} added by ${quantity}`
            });
        }

        return res.status(400).json({
            status: "success",
            message: `failed to add ${productResult.rows.at(0).name} added by ${quantity}`
        });

    }

    async function updateItem(req:any, res:any)
    {

        const itemId = req.params.id;
        const quantity = parseInt(req.body.quantity, 10);
        const userId = req.user.id;
        const query =  `SELECT *, ci.id as ciid, p.  FROM master.cart_items as ci
                            JOIN master.products as p
                                ON p.id = ci.product_id
                            JOIN master.carts as c
                                 ON c.user_id = $3
                            WHERE p.status = $1 AND
                             ci.id = $2
                        `;
        const result = await context.pool.query(query, ['ACTIVE' , itemId, userId]);

        if(result.rowCount > 0) {
            const query = `UPDATE master.cart_items SET quantity = $1 WHERE id=$2 RETURNING *`;

            const cartRes = await context.pool.query(query, [quantity, result.rows.at(0).ciid ]);

            if(cartRes.rowCount > 0) {
                return res.status(200).json({
                    status: "success",
                    message: `item ${cartRes.rows.at(0).id} changed by ${quantity}`
                });
            }

            return res.status(400).json({
                status: "failed",
                message : "empty cart no such item"
            })
        }

        return res.status(400).json({
            status: "failed",
            message: "Invalid cart item"
        })
    }

    async function deleteItem(req:any, res:any)
    {
        const query = `DELETE FROM master.cart_items WHERE id = $1 RETURNING *`;
        const result = await context.pool.query(query, [req.params.id]);

        if (result.rowCount > 0) {
            return res.status(200).json({
                status: "success",
                message: `item ${req.params.id} successfully deleted`
            });
        }

        return res.status(400).json({
            status: "failed",
            message: `failed to delete item ${req.params.id}`
        });
    }

    async function deleteCart(req:any, res:any, dbContext?:any)
    {
        const client = dbContext ?? context.pool;

        const  cartQ = `SELECT id FROM master.carts WHERE user_id=$1`;

        const cartRes = await client.query(cartQ, [req.user.id]);

        console.log(cartRes);

        if (cartRes.rowCount > 0) {
            const query = `DELETE FROM master.cart_items WHERE cart_id = $1 RETURNING *`;
            const result = await client.query(query, [cartRes.rows.at(0).id]);

            if (result.rowCount > 0) {

                const  cartQ = `DELETE FROM master.carts WHERE user_id=$1`;

                const cartRes = await client.query(cartQ, [req.user.id]);

                if(cartRes.rowCount > 0) {
                    const response = {
                        status: "success",
                        message: `cart successfully deleted`
                    };

                    return dbContext ? response :
                     res.status(200).json({
                        status: "success",
                        message: `cart successfully deleted`
                    });
                }
            }
        }

        const response = {
            status: "failed",
            message: `failed to delete cart`
        };

        return dbContext ? response :
        res.status(400).json({
            status: "failed",
            message: `failed to delete cart`
        });
    }

    async function checkout(req:any, res:any)
    {
        const userId = req.user.id;
        const qry = `SELECT 1 FROM master.cart_items as ci JOIN master.carts AS ca ON ca.id = ci.cart_id WHERE ca.user_id=$1`;
        const cartResult = await context.pool.query(qry, [userId]);

        if (cartResult.rowCount < 1) {
            return res.status(400).json({
                status: "success",
                message: "cart is empty"
            })
        }

        const qryItem = `
            SELECT ci.cart_id as cart_id
            FROM master.carts AS ca

                     JOIN master.cart_items as ci
                          ON ca.id = ci.cart_id

                     left JOIN master.products as pr
                               ON ci.product_id = pr.id

            WHERE ca.user_id = $1
              AND (pr.status != $2 OR ci.quantity > pr.stock_quantity)
            ORDER BY ci.updated_at ASC
        `;
        const qryItemRes = await context.pool.query(qryItem, [userId, 'ACTIVE']);

        console.log(qryItemRes);
        if(qryItemRes.rowCount > 0) {
            return res.status(400).json({
                status: "success",
                message : "invalid product in the card"
            });
        }




        const qData = `select
                           COUNT(*),
                           cart_id,
                           SUM(cai.unit_price * cai.quantity)
                       from master.cart_items as cai
                                JOIN master.carts cas
                                     ON cas.id = cai.cart_id
                       where cas.user_id = $1
                       Group BY cart_id`;
        const cartDetail = await context.pool.query(qData, [userId]);


        console.log(cartDetail);
        const client = await context.pool.connect();

        await client.query('BEGIN');

        try {
            if(cartDetail.rowCount > 0) {
                const orderId = uuidv4();
                const orderQ =  `INSERT INTO master.orders
                            (user_id,
                             order_number,
                             status,
                             subtotal,
                             total_items)
                         VALUES ($1, $2, $3, $4, $5) RETURNING *`;

                const orderRes = await client.query(orderQ, [userId, orderId, 'PENDING', cartDetail.rows.at(0).sum, cartDetail.rows.at(0).count]);

                if(orderRes.rowCount > 0) {

                    const orderItems = `INSERT INTO master.order_items 
                                            (order_id,
                                            product_id,
                                            quantity,
                                            unit_price,
                                            line_total)
                                        
                                        SELECT $1 as order_id,
                                               product_id,
                                               quantity,
                                               unit_price,
                                               unit_price * quantity AS line_total
                                        FROM master.cart_items AS cai
                                        WHERE cart_id = $2
                                        RETURNING *
                                        `;

                    const orderItem = await client.query(orderItems, [orderRes.rows.at(0).id, cartDetail.rows.at(0).cart_id]);

                    if(orderItem.rowCount > 0) {

                        const response = await deleteCart(req, res, client);

                        if(0 || response.status === 'success') {
                            await client.query('COMMIT');
                            return res.status(200).json({
                                status: "success",
                                message: "order placed successfully"
                            });
                        } else {
                            await client.query('COMMIT');
                            return res.status(200).json({
                                status: "success",
                                message: "order placed successfully, cart deletion failed"
                            });
                        }
                    }
                }
            }
            await client.query('COMMIT');

            return res.status(400).json({
                status: "success",
                message: "checkout failed"
            });
        } catch (error) {
            console.error(error);
            await client.query('ROLLBACK');
            return res.status(400).json({
                status: "failed",
                message: "check internal issue, try again later"
            });
        }

    }


    return { getCart, addItem, updateItem, deleteItem, deleteCart, checkout };
}


function fileUploadConfig(context:any)
{
    const connectFile = connect();
    function connect()
    {
        const uploadDir = path.join(process.cwd(), 'storage/uploads');

        if(!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const storage = multer.diskStorage({
            destination: uploadDir,
            filename: (req, file, cb) => {
                const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
                cb(null, uniqueName);
            }
        });


        const upload = multer({
            storage: storage,
            limits : {
                fileSize : context.env.MAX_FILE_UPLOAD || 5 * 1024 * 102
            }
        });

        return {upload, uploadDir, storage}
    }

    async function uploadFile(req: any, res: any) {
        return new Promise((resolve, reject) => {
            connectFile.upload.single('file')(req, res, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(req.file);
                }
            });
        });
    }

    async function uploadMultiple(req: any, res: any, maxCount: number = 5) {
        return new Promise((resolve, reject) => {
            connectFile.upload.array('files', maxCount)(req, res, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(req.files);
                }
            });
        });
    }

    return {connect, uploadFile, uploadMultiple, connectFile}
}


function fileUploadRecords(context:any)
{
    async function saveFileRecord(pool: any, userId: number, file: Express.Multer.File) {
        const query = `
            INSERT INTO master.files (
                user_id,
                original_name,
                stored_name,
                mime_type,
                size,
                storage_path
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            userId,
            file.originalname,
            file.filename,
            file.mimetype,
            file.size,
            file.path
        ];

        const result = await context.pool.query(query, values);

        if(result.rowCount > 0) {
            return {"status": "success", data : result.rows[0]};
        }
        return {"status": "failed", data : []};
    }

    // Get user files
    async function getUserFiles(pool: any, userId: number) {
        const query = `
            SELECT id, original_name, mime_type, size, created_at
            FROM master.files
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // Delete file
    async function deleteFile(pool: any, fileId: number, userId: number) {
        // Get file record
        const getQuery = `SELECT * FROM master.files WHERE id = $1 AND user_id = $2`;
        const fileResult = await pool.query(getQuery, [fileId, userId]);

        if (fileResult.rowCount === 0) {
            throw new Error('File not found or unauthorized');
        }

        const file = fileResult.rows[0];

        // Delete from database
        const deleteQuery = `DELETE FROM files WHERE id = $1 RETURNING *`;
        await pool.query(deleteQuery, [fileId]);

        // Delete physical file
        try {
            fs.unlinkSync(file.storage_path);
        } catch (error) {
            console.error('Failed to delete physical file:', error);
        }

        return file;
    }

    return {
        saveFileRecord,
        getUserFiles,
        deleteFile
    };

}


function fileUploader(context:any, records:any)
{

    async function uploadFile(req:any, res:any) : Promise<any>
    {
        const file = await context.file.uploadMultiple(req, res, 5);
        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        // Log file info to see what we got
        console.log('File uploaded:', {
            originalName: req.file.originalname,
            storedName: req.file.filename,
            size: req.file.size,
            mimeType: req.file.mimetype,
            path: req.file.path
        });

        // Return success with file info
        return res.status(200).json({
            status: 'success',
            message: 'File uploaded successfully',
            data: {
                originalName: req.file.originalname,
                storedName: req.file.filename,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

    }

    async function uploadFiles(req: any, res: any)
    {
        try {
            const files = await context.file.uploadMultiple(req, res, 5);

            if (!files || files.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No files uploaded'
                });
            }

            // Save all files
            // const savedFiles = await Promise.all(
            //     files.map(file => saveToDatabase(req.user.id, file))
            // );

            return res.status(200).json({
                status: 'success',
                // data: savedFiles
                data : files
            });

        } catch (error:any) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async function uploadProfile(req: any, res: any)
    {
        const file = await context.file.uploadFile(req, res);

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }


        // Log file info to see what we got
        console.log('File uploaded:', {
            originalName: req.file.originalname,
            storedName: req.file.filename,
            size: req.file.size,
            mimeType: req.file.mimetype,
            path: req.file.path
        });

        const dbStore = await records.saveFileRecord(context.pool, req.user.id, file);

        if (dbStore.status === 'success') {
            // Return success with file info
            return res.status(200).json({
                status: 'success',
                message: 'File uploaded successfully',
                data: dbStore
            });
        }

        return res.status(400).json({
            status: 'success',
            message: 'File not uploaded successfully',
            data: {
                originalName: req.file.originalname,
                storedName: req.file.filename,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });
    }

    async function uploadProfiles(req: any, res: any)
    {
        const files = await context.file.uploadMultiple(req, res, 5);

        console.log(files);

        if (!files) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }


        // Log file info to see what we got
        console.log('File uploaded:', files);

        const dbStore = await Promise.all(
            files.map((file:any) => records.saveFileRecord(context.pool, req.user.id, file))
        );

        if (dbStore) {
            // Return success with file info
            return res.status(200).json({
                status: 'success',
                message: 'File uploaded successfully',
                data: dbStore,
                files : files
            });
        }

        return res.status(400).json({
            status: 'success',
            message: 'File not uploaded successfully',
            data: files
        });
    }

    async function serveFile(req:any, res:any)
    {
        try {
            const fileId = parseInt(req.params.id);

            const result = await context.pool.query(
                'SELECT * FROM master.files WHERE id = $1 AND user_id = $2',
                [fileId, req.user.id]
            );


            if (result.rowCount === 0) {
                throw new Error('File not found');
            }

            const file = result.rows[0];

            // Check if file exists physically
            if (!fs.existsSync(file.storage_path)) {
                throw new Error('File not found on disk');
            }

            // Set content type for viewing
            res.setHeader('Content-Type', file.mime_type);

            // Stream the file (memory efficient)
            const stream = fs.createReadStream(file.storage_path);
            stream.pipe(res);
        } catch (error:any) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }


    async function downloadFile(req:any, res:any)
    {
        const fileId = parseInt(req.params.id);

        const result = await context.pool.query(
            'SELECT * FROM master.files WHERE id = $1 AND user_id = $2',
            [fileId, req.user.id]
        );

        if (result.rowCount === 0) {
            throw new Error('File not found');
        }

        const file = result.rows[0];

        if (!fs.existsSync(file.storage_path)) {
            throw new Error('File not found on disk');
        }

        res.setHeader('Content-Type', file.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Length', file.size);

        // Stream the file
        const stream = fs.createReadStream(file.storage_path);
        stream.pipe(res);

    }

    async function streamFile(req:any, res:any) {
        const fileId = req.params.id;

        const result = await context.pool.query(
            'SELECT * FROM master.files WHERE id = $1 AND user_id = $2',
            [fileId, req.user.id]
        );

        if (result.rowCount === 0) {
            throw new Error('File not found');
        }

        const file = result.rows[0];
        const stat = fs.statSync(file.storage_path);
        const fileSize = stat.size;
        const range = req.headers.range;


        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': file.mime_type,
            });

            const stream = fs.createReadStream(file.storage_path, {start, end});
            stream.pipe(res);

        } else {
            // Full file
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': file.mime_type,
            });
            const stream = fs.createReadStream(file.storage_path);
            stream.pipe(res);
        }

    }

    function shouldViewInBrowser(mimeType: string): boolean {
        const viewable = [
            'image/jpeg', 'image/png', 'image/gif',
            'text/plain', 'text/html',
            'application/pdf'
        ];
        return viewable.includes(mimeType);
    }

    function shouldDownload(mimeType: string): boolean {
        const downloadable = [
            'application/zip',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        return downloadable.includes(mimeType);
    }


    return {uploadFile, uploadFiles, uploadProfile, uploadProfiles, serveFile, downloadFile, streamFile}
}




let context:any;
{
    dotenv.config();

    const env = Env();

    const hash = Pass(env);

    const db = Database(env);

    const pool = db.connect();

    context = ContextObject(env, db, pool, hash);

    context.paginate = Paginate(context);

    context.token = Token(context);

    context.redis = Redis(context);

    context.file = fileUploadConfig(context);

    (async () => {

        context.redisClient = await context.redis.connect();

        console.log("Redis client initialized successfully.");

    })().catch(err => {

        console.error("Failed to connect to Redis inline:", err);

    });

    context.refreshToken = RefreshToken(context, User(context));

    context.auth = Auth(context);
}

function 

function ecomRoutes(app: any)
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

    app.post('/logout', context.auth.validate, context.auth.logout);

}


function productRoutes(app: any)
{
    app.get('/products', Product(context).products);

    app.get('/products/:id', Product(context).product);

    app.post('/products', Product(context).updateProduct);

    app.patch('/products/:id', Product(context).patchProduct);

    app.delete('/products/:id', Product(context).deleteProduct);
}


function cartRoutes(app: any)
{
   app.get('/cart', context.auth.validate, Cart(context).getCart);

    app.post('/cart/items', context.auth.validate, Cart(context).addItem);

   app.patch('/card/items/:id', context.auth.validate, Cart(context).updateItem);

    app.delete('/cart/items/:id', context.auth.validate, Cart(context).deleteItem);

    app.delete('/cart', context.auth.validate, Cart(context).deleteCart);

    app.post('/checkout',  context.auth.validate, Cart(context).checkout);
}


function fileRoutes(app: any)
{
    app.post('/file/upload/test', context.auth.validate, fileUploader(context, fileUploadRecords(context)).uploadFile);

    app.post('/file/upload', context.auth.validate, fileUploader(context, fileUploadRecords(context)).uploadProfile);

    app.post('/files/upload', context.auth.validate, fileUploader(context, fileUploadRecords(context)).uploadProfiles);

    app.post('/file/serve/:id', context.auth.validate, fileUploader(context, fileUploadRecords(context)).serveFile);

    app.post('/file/download/:id', context.auth.validate, fileUploader(context, fileUploadRecords(context)).downloadFile);

    app.post('/file/stream', context.auth.validate, fileUploader(context, fileUploadRecords(context)).streamFile);

}

module.exports = {
    ecomRoutes,
    productRoutes,
    cartRoutes,
    fileRoutes
};




