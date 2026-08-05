import dotenv from "dotenv";
import {DatabaseError, Pool} from "pg";
import bcrypt from "bcryptjs";

// 1. build a common context

function ContextObject(env:any, db?:any, pool?:any, hash?:any)
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
        SALT : process.env.SALT
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

    return {
        encrypt
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

    async function userExists(userId: number)
    {
        try {
            const query = 'SELECT 1 FROM mater.users WHERE id=$1';
            const result = await context.pool.query(query, userId);

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

                query +=` AND role_id = ${roleId}`;
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

    async function getUser()
    {

    }

    return {
        createUser,
        deleteUser,
        updateUser,
        updateUserStatus,
        getUsers
    }
}


module.exports = function ecomRoutes(app: any)
{
    app.get('/health', dbHealth(context).health);
    app.post('/user', User(context).createUser);
    app.delete('/user/:id', User(context).deleteUser);
    app.post('/user/:id', User(context).updateUser);
    app.post('/user/:id/status', User(context).updateUserStatus);
    app.get('/users-list', User(context).getUsers);
};


