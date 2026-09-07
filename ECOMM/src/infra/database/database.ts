import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
    Router
} from "express";
import {
    Pool,
    PoolClient,
    PoolConfig
} from "pg";

/* ============================================================
 * TYPES
 * ============================================================ */

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface DatabaseConnectionConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

interface DomainDatabaseConfig {
    master?: DatabaseConnectionConfig;
    client?: DatabaseConnectionConfig;
}

interface DomainConfig {
    status: boolean;
    master: boolean;
    client: boolean;
    connectClientSchema: boolean;
    database: DomainDatabaseConfig;
}

type DomainsConfig = Record<string, DomainConfig>;

interface ApiRegistration {
    id: string;
    method: ApiMethod;
    path: string;
    domain: string;
    tenant: boolean;
}

interface ApiContext {
    id: string;
    method: ApiMethod;
    path: string;
    domain: string;
}

interface TenantContext {
    id: string;
}

interface RequestContext {
    api: ApiContext;
    tenant?: TenantContext;
}

/* ============================================================
 * EXPRESS REQUEST EXTENSION
 * ============================================================ */

declare global {
    namespace Express {
        interface Request {
            context?: RequestContext;
        }
    }
}

/* ============================================================
 * DATABASE
 * ============================================================ */

export class Database {
    private readonly domains: DomainsConfig;
    private readonly pools = new Map<string, Pool>();

    constructor(domains: DomainsConfig) {
        this.domains = domains;
    }

    public domain(domainName: string): DomainConfig {
        const domain = this.domains[domainName];
        if (!domain) {
            throw new Error(`Database domain does not exist: ${domainName}`);
        }
        if (!domain.status) {
            throw new Error(`Database domain is disabled: ${domainName}`);
        }
        return domain;
    }

    public master(domainName: string): Pool {
        const domain = this.domain(domainName);
        if (!domain.master) {
            throw new Error(`Master database is not enabled for domain: ${domainName}`);
        }
        if (!domain.database.master) {
            throw new Error(`Master database configuration missing for domain: ${domainName}`);
        }
        return this.getPool(domainName, "master", domain.database.master);
    }

    public client(domainName: string): Pool {
        const domain = this.domain(domainName);
        if (!domain.client) {
            throw new Error(`Client database is not enabled for domain: ${domainName}`);
        }
        if (!domain.database.client) {
            throw new Error(`Client database configuration missing for domain: ${domainName}`);
        }
        return this.getPool(domainName, "client", domain.database.client);
    }

    private getPool(
        domainName: string,
        databaseType: "master" | "client",
        config: DatabaseConnectionConfig
    ): Pool {
        const poolKey = `${domainName}:${databaseType}`;
        const existingPool = this.pools.get(poolKey);
        if (existingPool) {
            return existingPool;
        }

        const poolConfig: PoolConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            // Production-ready pool settings
            max: parseInt(process.env.PG_POOL_MAX || "20", 10),
            idleTimeoutMillis: parseInt(process.env.PG_POOL_IDLE_TIMEOUT || "30000", 10),
            connectionTimeoutMillis: parseInt(process.env.PG_POOL_CONNECTION_TIMEOUT || "2000", 10),
        };

        const pool = new Pool(poolConfig);

        // Critical: Pool error handling
        pool.on("error", (err) => {
            console.error(`Pool error for ${poolKey}:`, err);
        });

        this.pools.set(poolKey, pool);
        return pool;
    }

    public async close(): Promise<void> {
        const pools = Array.from(this.pools.values());
        await Promise.all(pools.map(pool => pool.end()));
    }

    // Health check method
    public async healthCheck(domain: string): Promise<boolean> {
        try {
            const pool = this.master(domain);
            await pool.query("SELECT 1");
            return true;
        } catch (error) {
            console.error(`Health check failed for ${domain}:`, error);
            return false;
        }
    }
}

/* ============================================================
 * API REGISTRY - SINGLE DEFINITION
 * ============================================================ */

export class ApiRegistry {
    private readonly apis = new Map<string, ApiRegistration>();

    constructor(private readonly database: Database) {}

    public register(registration: ApiRegistration): void {
        if (this.apis.has(registration.id)) {
            throw new Error(`API is already registered: ${registration.id}`);
        }

        // Validate domain exists and is enabled
        this.database.domain(registration.domain);

        this.apis.set(registration.id, registration);
    }

    public get(apiId: string): ApiRegistration {
        const api = this.apis.get(apiId);
        if (!api) {
            throw new Error(`API is not registered: ${apiId}`);
        }
        return api;
    }

    public list(): ApiRegistration[] {
        return Array.from(this.apis.values());
    }
}

/* ============================================================
 * TENANT VALIDATOR
 * ============================================================ */

export interface TenantValidatorStrategy {
    validate(domain: string, tenantId: string): Promise<TenantContext>;
}

export class TenantValidator implements TenantValidatorStrategy {
    constructor(private readonly database: Database) {}

    public async validate(domain: string, tenantId: string): Promise<TenantContext> {
        const pool = this.database.master(domain);
        const client = await pool.connect();

        try {
            // Domain-specific tenant validation
            // Each domain can override this
            const result = await client.query(
                `
                SELECT id
                FROM tenants
                WHERE id = $1 AND status = 'active'
                LIMIT 1
                `,
                [tenantId]
            );

            if (result.rowCount === 0) {
                throw new Error(`Invalid or inactive tenant: ${tenantId}`);
            }

            return {
                id: String(result.rows[0].id)
            };
        } finally {
            // CRITICAL: Release connection back to pool
            client.release();
        }
    }
}

/* ============================================================
 * REQUEST CONTEXT BUILDER
 * ============================================================ */

export class RequestContextBuilder {
    constructor(
        private readonly apiRegistry: ApiRegistry,
        private readonly tenantValidator: TenantValidatorStrategy
    ) {}

    public async build(request: Request, apiId: string): Promise<RequestContext> {
        // 1. Find registered API
        const api = this.apiRegistry.get(apiId);

        // 2. Build API context
        const context: RequestContext = {
            api: {
                id: api.id,
                method: api.method,
                path: api.path,
                domain: api.domain
            }
        };

        // 3. If tenant not required, return early
        if (!api.tenant) {
            return context;
        }

        // 4. Read tenant ID from header
        const tenantId = request.header("x-tenant-id");
        if (!tenantId) {
            throw new Error("Tenant ID is required");
        }

        // 5. Validate tenant
        const tenant = await this.tenantValidator.validate(api.domain, tenantId);

        // 6. Add tenant context
        context.tenant = tenant;

        return context;
    }
}

/* ============================================================
 * REGISTERED ROUTER - CORRECT VERSION (Version 1)
 * ============================================================ */

export class RegisteredRouter {
    private readonly router = Router();

    constructor(
        private readonly registry: ApiRegistry,
        private readonly contextBuilder: RequestContextBuilder
    ) {}

    public register(api: ApiRegistration, handler: RequestHandler): void {
        // Register API metadata
        this.registry.register(api);

        // Context middleware - this runs BEFORE the handler
        const contextMiddleware = async (
            request: Request,
            response: Response,
            next: NextFunction
        ) => {
            try {
                const context = await this.contextBuilder.build(request, api.id);
                request.context = context;
                next();
            } catch (error) {
                next(error);
            }
        };

        // Register Express route with middleware
        switch (api.method) {
            case "GET":
                this.router.get(api.path, contextMiddleware, handler);
                break;
            case "POST":
                this.router.post(api.path, contextMiddleware, handler);
                break;
            case "PUT":
                this.router.put(api.path, contextMiddleware, handler);
                break;
            case "PATCH":
                this.router.patch(api.path, contextMiddleware, handler);
                break;
            case "DELETE":
                this.router.delete(api.path, contextMiddleware, handler);
                break;
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

/* ============================================================
 * DOMAIN CONFIGURATION
 * ============================================================ */

const domains: DomainsConfig = {
    identity_access_management: {
        status: true,
        master: true,
        client: true,
        connectClientSchema: true,
        database: {
            master: {
                host: process.env.PG_IAM_MASTER_HOST ?? "127.0.0.1",
                port: Number(process.env.PG_IAM_MASTER_PORT ?? 5432),
                user: process.env.PG_IAM_MASTER_USERNAME ?? "root",
                password: process.env.PG_IAM_MASTER_PASSWORD ?? "",
                database: process.env.PG_IAM_MASTER_DATABASE ?? "identity_access_management_master"
            },
            client: {
                host: process.env.PG_IAM_CLIENT_HOST ?? "127.0.0.1",
                port: Number(process.env.PG_IAM_CLIENT_PORT ?? 5432),
                user: process.env.PG_IAM_CLIENT_USERNAME ?? "root",
                password: process.env.PG_IAM_CLIENT_PASSWORD ?? "",
                database: process.env.PG_IAM_CLIENT_DATABASE ?? "identity_access_management_client"
            }
        }
    }
};

/* ============================================================
 * APPLICATION INFRASTRUCTURE - SINGLE INSTANCE
 * ============================================================ */

const database = new Database(domains);
const apiRegistry = new ApiRegistry(database);
const tenantValidator = new TenantValidator(database);
const requestContextBuilder = new RequestContextBuilder(apiRegistry, tenantValidator);
const registeredRouter = new RegisteredRouter(apiRegistry, requestContextBuilder);

/* ============================================================
 * API REGISTRATION
 * ============================================================ */

// Tenant API with validation
registeredRouter.register(
    {
        id: "iam.user.get",
        method: "GET",
        path: "/users/:id",
        domain: "identity_access_management",
        tenant: true
    },
    async (request: Request, response: Response) => {
        const context = request.context;
        response.json({
            message: "User API",
            context
        });
    }
);

// Master-level API (no tenant required)
registeredRouter.register(
    {
        id: "iam.tenant.create",
        method: "POST",
        path: "/tenants",
        domain: "identity_access_management",
        tenant: false
    },
    async (request: Request, response: Response) => {
        response.json({
            message: "Tenant creation API",
            context: request.context
        });
    }
);

/* ============================================================
 * EXPRESS APP
 * ============================================================ */

const app = express();
app.use(express.json());
app.use("/api", registeredRouter.getRouter());

/* ============================================================
 * ERROR HANDLER
 * ============================================================ */

app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
    response.status(400).json({
        error: error.message
    });
});

/* ============================================================
 * SERVER WITH HEALTH CHECK
 * ============================================================ */

const server = app.listen(3000, () => {
    console.log("Server running on port 3000");

    // Startup validation
    database.healthCheck("identity_access_management")
        .then(healthy => {
            console.log(`Database health check: ${healthy ? "✅ OK" : "❌ FAILED"}`);
        })
        .catch(err => {
            console.error("Startup validation failed:", err);
        });
});

/* ============================================================
 * GRACEFUL SHUTDOWN
 * ============================================================ */

const shutdown = async () => {
    console.log("Application shutting down...");

    server.close(async () => {
        // Give ongoing requests time to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        await database.close();
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error("Force shutdown");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

/* ============================================================
 * EXPORTS
 * ============================================================ */

export {
    database,
    apiRegistry,
    tenantValidator,
    requestContextBuilder,
    registeredRouter,
    app,
    server
};

export type {
    ApiMethod,
    ApiRegistration,
    ApiContext,
    TenantContext,
    RequestContext,
    DatabaseConnectionConfig,
    DomainDatabaseConfig,
    DomainConfig,
    DomainsConfig
};