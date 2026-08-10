import { randomUUID } from 'crypto';
import type { Server } from 'http';
import pino from 'pino';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { z } from 'zod';

type RequestLike = {
    method: string;
    originalUrl?: string;
    headers: Record<string, string | string[] | undefined>;
    requestId?: string;
};

type ResponseLike = {
    statusCode: number;
    setHeader(name: string, value: string): void;
    status(code: number): ResponseLike;
    json(body: unknown): unknown;
    on(event: 'finish', listener: () => void): void;
};

type Next = (error?: unknown) => void;

const environmentBoolean = z.preprocess((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}, z.boolean());

const environmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
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
});

export type AppEnvironment = z.output<typeof environmentSchema>;

/** Validates the deployment contract before infrastructure clients are created. */
export function loadEnvironment(source: NodeJS.ProcessEnv = process.env): AppEnvironment {
    const parsed = environmentSchema.safeParse(source);
    if (!parsed.success) {
        throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
    }

    const env = parsed.data;
    if (env.NODE_ENV === 'production') {
        const required = ['PG_MASTER_HOST', 'PG_MASTER_DATABASE', 'PG_MASTER_USERNAME', 'PG_MASTER_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;
        const missing = required.filter((key) => !env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
        }
        if (env.CORS_ORIGIN === '*') {
            throw new Error('CORS_ORIGIN must be an explicit allowlist in production');
        }
    }
    return env;
}

const registry = new Registry();
collectDefaultMetrics({ register: registry });
const requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests processed by the API',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
});
const requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
});

type RuntimeContext = {
    pool?: { query(sql: string): Promise<unknown>; end?: () => Promise<void> };
    redisClient?: { ping?: () => Promise<unknown>; quit?: () => Promise<void>; disconnect?: () => void };
    redis?: { connect?: () => Promise<{ ping?: () => Promise<unknown>; quit?: () => Promise<void>; disconnect?: () => void }> };
    worker?: { start?: () => void; stop?: () => void };
};

/** Shared application concerns while preserving feature-specific handler factories. */
export function createRuntime(context: RuntimeContext, env: AppEnvironment) {
    const logger = pino({
        level: env.LOG_LEVEL,
        redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'password_hash', 'token', 'refreshToken'],
        base: { service: 'ecomm', environment: env.NODE_ENV },
    });
    let shuttingDown = false;

    const requestContext = (req: RequestLike, res: ResponseLike, next: Next): void => {
        const headerRequestId = req.headers['x-request-id'];
        req.requestId = typeof headerRequestId === 'string' ? headerRequestId : randomUUID();
        res.setHeader('X-Request-Id', req.requestId);
        const startedAt = process.hrtime.bigint();

        res.on('finish', () => {
            const route = req.originalUrl?.split('?')[0] ?? 'unknown';
            const duration = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
            requestCounter.inc({ method: req.method, route, status_code: String(res.statusCode) });
            requestDuration.observe({ method: req.method, route, status_code: String(res.statusCode) }, duration);
            logger.info({ requestId: req.requestId, method: req.method, route, statusCode: res.statusCode, duration }, 'request completed');
        });
        next();
    };

    const asyncHandler = (handler: (req: any, res: any, next: Next) => Promise<unknown>) =>
        (req: any, res: any, next: Next): void => { void handler(req, res, next).catch(next); };

    const liveness = (_req: RequestLike, res: ResponseLike): unknown => res.status(200).json({ status: 'UP' });
    const readiness = async (_req: RequestLike, res: ResponseLike): Promise<unknown> => {
        try {
            await context.pool?.query('SELECT 1');
            if (!context.redisClient) throw new Error('Redis client is unavailable');
            if (context.redisClient.ping) await context.redisClient.ping();
            return res.status(200).json({ status: 'READY' });
        } catch (error) {
            logger.warn({ err: error }, 'readiness check failed');
            return res.status(503).json({ status: 'NOT_READY' });
        }
    };
    const metrics = async (_req: RequestLike, res: ResponseLike): Promise<void> => {
        res.setHeader('Content-Type', registry.contentType);
        (res as any).end(await registry.metrics());
    };
    const notFound = (req: RequestLike, res: ResponseLike): unknown => res.status(404).json({ status: 'failed', message: `Route not found: ${req.method} ${req.originalUrl}` });
    const errorHandler = (error: any, req: RequestLike, res: ResponseLike, _next: Next): unknown => {
        logger.error({ err: error, requestId: req.requestId }, 'request failed');
        const status = Number.isInteger(error?.status) ? error.status : 500;
        return res.status(status).json({ status: 'failed', message: status >= 500 ? 'Internal server error' : error.message, requestId: req.requestId });
    };

    async function start(): Promise<void> {
        const shouldCheckDependencies = env.STARTUP_DEPENDENCY_CHECK ?? env.NODE_ENV === 'production';
        if (shouldCheckDependencies) await context.pool?.query('SELECT 1');
        try {
            if (context.redis?.connect) context.redisClient = await context.redis.connect();
        } catch (error) {
            logger.warn({ err: error }, 'Redis startup failed; readiness will remain unavailable');
            if (shouldCheckDependencies) throw error;
        }
        if (env.ENABLE_QUEUE_WORKERS) context.worker?.start?.();
        logger.info('runtime initialized');
    }

    function configureServer(server: Server): void {
        server.requestTimeout = env.HTTP_REQUEST_TIMEOUT_MS;
        server.headersTimeout = env.HTTP_HEADERS_TIMEOUT_MS;
        server.keepAliveTimeout = env.HTTP_KEEP_ALIVE_TIMEOUT_MS;

        const shutdown = async (signal: string): Promise<void> => {
            if (shuttingDown) return;
            shuttingDown = true;
            logger.info({ signal }, 'graceful shutdown started');
            const forceExit = setTimeout(() => process.exit(1), env.SHUTDOWN_TIMEOUT_MS);
            forceExit.unref();
            try {
                context.worker?.stop?.();
                if (server.listening) {
                    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
                }
                if (context.redisClient?.quit) await context.redisClient.quit();
                else context.redisClient?.disconnect?.();
                await context.pool?.end?.();
                logger.info('graceful shutdown complete');
                process.exitCode = 0;
            } catch (error) {
                logger.error({ err: error }, 'graceful shutdown failed');
                process.exitCode = 1;
            } finally {
                clearTimeout(forceExit);
            }
        };

        process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
        process.once('SIGINT', () => { void shutdown('SIGINT'); });
        process.once('unhandledRejection', (error) => { logger.fatal({ err: error }, 'unhandled promise rejection'); void shutdown('unhandledRejection'); });
        process.once('uncaughtException', (error) => { logger.fatal({ err: error }, 'uncaught exception'); void shutdown('uncaughtException'); });
    }

    return { env, logger, requestContext, asyncHandler, liveness, readiness, metrics, notFound, errorHandler, start, configureServer };
}
