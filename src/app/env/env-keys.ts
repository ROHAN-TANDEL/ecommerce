export class EnvKeys {
    keyBind(env :any) {
        return {
            APP_PORT: Number(env.APP_PORT ?? 3000),
            LOG: { level: env.NODE_ENV === "development" ? "debug" : "info" },
            APP_NAME: env.APP_NAME,
            NODE_ENV: env.NODE_ENV,
            LOG_LEVEL: env.LOG_LEVEL,
            LOG_LEVEL_INFO: env.LOG_LEVEL_INFO,
            LOG_LEVEL_ERROR: env.LOG_LEVEL_ERROR,
            LOG_LEVEL_DEBUG: env.LOG_LEVEL_DEBUG,
            PG_MASTER_HOST: env.PG_MASTER_HOST,
            PG_MASTER_PORT: env.PG_MASTER_PORT,
            PG_MASTER_DATABASE: env.PG_MASTER_DATABASE,
            PG_MASTER_SCHEMA: env.PG_MASTER_SCHEMA,
            PG_MASTER_USERNAME: env.PG_MASTER_USERNAME,
            PG_MASTER_PASSWORD: env.PG_MASTER_PASSWORD,
            SALT: env.SALT,
            JWT_SECRET: env.JWT_SECRET,
            JWT_TTL: env.JWT_TTL,
            JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
            JWT_REFRESH_TTL: env.JWT_REFRESH_TTL,
            AUTH_TOKEN_BLOCKLIST_REDIS_KEY: env.AUTH_TOKEN_BLOCKLIST_REDIS_KEY,
            CLEANUP_DELETE_FILES: env.CLEANUP_DELETE_FILES,
            REDIS_URL: env.REDIS_URL,
            CORS_ORIGIN: env.CORS_ORIGIN,
            REQUEST_BODY_LIMIT: env.REQUEST_BODY_LIMIT,
            RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
            RATE_LIMIT_MAX: env.RATE_LIMIT_MAX,
            HTTP_REQUEST_TIMEOUT_MS: env.HTTP_REQUEST_TIMEOUT_MS,
            HTTP_HEADERS_TIMEOUT_MS: env.HTTP_HEADERS_TIMEOUT_MS,
            HTTP_KEEP_ALIVE_TIMEOUT_MS: env.HTTP_KEEP_ALIVE_TIMEOUT_MS,
            SHUTDOWN_TIMEOUT_MS: env.SHUTDOWN_TIMEOUT_MS,
            STARTUP_DEPENDENCY_CHECK: env.STARTUP_DEPENDENCY_CHECK,
            ENABLE_QUEUE_WORKERS: env.ENABLE_QUEUE_WORKERS
        };
    }
}
//# sourceMappingURL=env-keys.js.map