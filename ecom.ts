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

    async function insertUser(user:any) {

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
                user.status,
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

            throw error;
        }

    }

    async function createUser(req:any, res:any) {

        try {
            const user = req.body;

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
            console.log(roles, user, roles.some((roleObj: { name: any; }) => roleObj.name === user.role), roles.includes(user.role));
            if (roles.some((roleObj: { name: any; }) => roleObj.name === user.role)) {

                const foundRole = roles.find((r: { name: string; id: string }) =>
                    r.name.toLowerCase() === 'admin' || r.name.toLowerCase() === 'user'
                );

                user.role_id = foundRole.id;

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

            if(result && result.rows && result.rows.length > 0) {
                return res.status(201).json({
                    status: "success",
                    message: result.rows
                });
            }

            if (result && result.status === "error" ) {
                return res.status(400).json({
                    "status": "failed",
                    "message": result.message
                });
            }

            if (!result || result.rows === undefined) {
                return res.status(400).json({
                    "status": "failed",
                    "message": "user not created, new user insertion failed"
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

    async function deleteUser(req:any, res:any) {}
    async function updateUser(req:any, res:any) {}

    return {
        createUser
    }
}


module.exports = function ecomRoutes(app: any)
{
    app.get('/health', dbHealth(context).health);
    app.post('/user', User(context).createUser);
};


