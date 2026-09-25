// app.ts

import express, { Router, Request, Response, NextFunction } from 'express';
import {
    ConnectionManager,
    ApiRegistry,
    TenantValidator,
    ContextBuilder,
    ApiContextMiddleware
} from './platform';

// ============================================================
// 1. Initialize Platform
// ============================================================

const connectionManager = new ConnectionManager();
const apiRegistry = new ApiRegistry(connectionManager);
const tenantValidator = new TenantValidator(connectionManager);
const contextBuilder = new ContextBuilder(
    connectionManager,
    apiRegistry,
    tenantValidator
);
const apiMiddleware = new ApiContextMiddleware(
    connectionManager,
    apiRegistry,
    contextBuilder
);

// ============================================================
// 2. Register APIs
// ============================================================

// Identity Access Management APIs
apiRegistry.register({
    id: 'iam.user.get',
    method: 'GET',
    path: '/users/:id',
    domain: 'identity_access_management',
    tenant: true
});

apiRegistry.register({
    id: 'iam.user.list',
    method: 'GET',
    path: '/users',
    domain: 'identity_access_management',
    tenant: true
});

apiRegistry.register({
    id: 'iam.user.create',
    method: 'POST',
    path: '/users',
    domain: 'identity_access_management',
    tenant: true
});

apiRegistry.register({
    id: 'iam.tenant.create',
    method: 'POST',
    path: '/tenants',
    domain: 'identity_access_management',
    tenant: false
});

// Authorization Management APIs
apiRegistry.register({
    id: 'authz.role.get',
    method: 'GET',
    path: '/roles/:id',
    domain: 'authorization_management',
    tenant: true
});

apiRegistry.register({
    id: 'authz.role.list',
    method: 'GET',
    path: '/roles',
    domain: 'authorization_management',
    tenant: true
});

apiRegistry.register({
    id: 'authz.permission.check',
    method: 'POST',
    path: '/permissions/check',
    domain: 'authorization_management',
    tenant: true
});

// ============================================================
// 3. Express App
// ============================================================

const app = express();

// Middleware
app.use(express.json());

// CRITICAL: Add API Context Middleware
// This runs on EVERY request BEFORE routes
app.use(apiMiddleware.getHandler());

// ============================================================
// 4. Routes (Completely Clean - No Wrappers!)
// ============================================================

const router = Router();

// Identity Access Management Routes
router.get('/users/:id', async (req: Request, res: Response) => {
    // Access context from request
    const context = req.context!;

    // Access master database from context
    const pool = context.db.master;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

    res.json({
        user: result.rows[0],
        context: {
            domain: context.api.domain,
            tenant: context.tenant
        }
    });
});

router.get('/users', async (req: Request, res: Response) => {
    const context = req.context!;
    const pool = context.db.master;
    const result = await pool.query('SELECT * FROM users LIMIT 100');

    res.json({
        users: result.rows,
        context: {
            domain: context.api.domain,
            tenant: context.tenant
        }
    });
});

router.post('/users', async (req: Request, res: Response) => {
    const context = req.context!;
    const pool = context.db.master;
    const { name, email } = req.body;

    const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    );

    res.json({
        user: result.rows[0],
        context: {
            domain: context.api.domain,
            tenant: context.tenant
        }
    });
});

router.post('/tenants', async (req: Request, res: Response) => {
    const context = req.context!;
    const pool = context.db.master;
    const { name, id } = req.body;

    const result = await pool.query(
        'INSERT INTO tenants (id, name, status) VALUES ($1, $2, $3) RETURNING *',
        [id, name, 'active']
    );

    res.json({
        tenant: result.rows[0],
        context: {
            domain: context.api.domain
        }
    });
});

// Authorization Management Routes
router.get('/roles/:id', async (req: Request, res: Response) => {
    const context = req.context!;
    const pool = context.db.master;
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [req.params.id]);

    res.json({
        role: result.rows[0],
        context: {
            domain: context.api.domain,
            tenant: context.tenant
        }
    });
});

router.get('/roles', async (req: Request, res: Response) => {
    const context = req.context!;
    const pool = context.db.master;
    const result = await pool.query('SELECT * FROM roles LIMIT 100');

    res.json({
        roles: result.rows,
        context: {
            domain: context.api.domain,
            tenant: context.tenant
        }
    });
});

router.post('/permissions/check', async (req: Request, res: Response) => {
    const context = req.context!;
    const pool = context.db.master;
    const { userId, permission } = req.body;

    // Simple permission check
    const result = await pool.query(
        `SELECT 1 FROM user_permissions up 
         JOIN permissions p ON p.id = up.permission_id 
         WHERE up.user_id = $1 AND p.name = $2`,
        [userId, permission]
    );

    res.json({
        hasPermission: result.rowCount > 0,
        context: {
            domain: context.api.domain,
            tenant: context.tenant
        }
    });
});

app.use('/api', router);

// ============================================================
// 5. Error Handler
// ============================================================

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error.message);
    res.status(400).json({
        error: error.message,
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// 6. Start Server
// ============================================================

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log('📋 Registered APIs:');
    for (const api of apiRegistry.list()) {
        console.log(`   ${api.method} ${api.path} → ${api.id} (${api.domain})`);
    }
    console.log('\n✅ Platform ready!');
});

// ============================================================
// 7. Graceful Shutdown
// ============================================================

const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);

    server.close(async () => {
        await connectionManager.closeAll();
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Force shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app, connectionManager, apiRegistry };