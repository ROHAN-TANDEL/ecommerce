import z from "zod";

export class EnvValidator {
    validate() {
        const environmentBoolean = z.preprocess((value) => {
            if (value === 'true')
                return true;
            if (value === 'false')
                return false;
            return value;
        }, z.boolean());
        return {
            APP_NAME: z.string(),
            NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
            PORT: z.coerce.number().int().min(1).max(65535).default(3000),
            APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
            LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
            PG_MASTER_HOST: z.string().min(1).optional(),
            PG_MASTER_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
            PG_MASTER_DATABASE: z.string().min(1).optional(),
            PG_MASTER_SCHEMA: z.string().optional(),
            PG_MASTER_USERNAME: z.string().min(1).optional(),
            PG_MASTER_PASSWORD: z.string().min(1).optional(),
            SALT: z.coerce.number().int().min(4).max(15).default(10),
            JWT_SECRET: z.string().min(32).optional(),
            JWT_TTL: z.string().default('15m'),
            JWT_REFRESH_SECRET: z.string().min(32).optional(),
            JWT_REFRESH_TTL: z.string().default('7d'),
            AUTH_TOKEN_BLOCKLIST_REDIS_KEY: z.string().default('auth:blocklist'),
            CLEANUP_DELETE_FILES: z.string().optional(),
            REDIS_URL: z.string().url().default('redis://admin:adminpass@localhost:6379'),
            CORS_ORIGIN: z.string().default('*'),
            REQUEST_BODY_LIMIT: z.string().default('1mb'),
            RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
            RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
            HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
            HTTP_HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(35_000),
            HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
            SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
            STARTUP_DEPENDENCY_CHECK: environmentBoolean.optional(),
            ENABLE_QUEUE_WORKERS: environmentBoolean.default(false),
            LOG_LEVEL_INFO: z.string(),
            LOG_LEVEL_ERROR: z.string(),
            LOG_LEVEL_DEBUG: z.string()
        };
    }
}
//# sourceMappingURL=env-validator.js.map