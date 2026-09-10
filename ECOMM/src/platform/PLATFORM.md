# Platform Developer Guide

The platform is the infrastructure layer that owns database domains, connection pools,
tenant resolution, and route registration. This document is the reference for any developer
adding a new domain, a new route, or writing controller code that touches the database.

---

## Mental model

```
products.json          → defines what domains exist and their databases
routeModules (Map)     → maps route class names to actual classes
createPlatformContext  → wires everything together at startup

Per request:
  RouteBinder          → sets req.productId, req.routeType, req.api
  TenantMiddleware     → sets req.tenant, req.tenantId, req.db  (client routes only)
  Your controller      → uses req.db to query
```

Every concept follows one rule: **the domain boundary is the unit of isolation**.
A route belongs to one domain. A domain owns its own databases. A controller never
reaches into another domain's database.

---

## 1. Adding a new domain

### Step 1 — Add the domain to `products.json`

```json
{
  "id": "subscription_management",
  "name": "Subscription Management",
  "enabled": true,
  "routes": {
    "client": ["SubscriptionRoute", "InvoiceRoute"],
    "master": ["SubscriptionAdminRoute"]
  },
  "roles": {
    "master": {
      "enabled": true,
      "database": {
        "host": "localhost",
        "port": 5432,
        "database": "subscription_master",
        "schema": "public",
        "user": "postgres",
        "password": "postgres",
        "pool": {
          "maxConnections": 20,
          "idleTimeout": 30000,
          "connectionTimeout": 5000,
          "maxUses": 7500,
          "keepAlive": true,
          "keepAliveInitialDelay": 10000,
          "statementTimeout": 30000,
          "queryTimeout": 30000
        }
      }
    },
    "client": {
      "enabled": true,
      "database": {
        "host": "localhost",
        "port": 5432,
        "database": "subscription_client",
        "user": "postgres",
        "password": "postgres",
        "pool": {
          "maxConnections": 30,
          "idleTimeout": 30000,
          "connectionTimeout": 5000,
          "maxUses": 7500,
          "keepAlive": true,
          "keepAliveInitialDelay": 10000,
          "statementTimeout": 30000,
          "queryTimeout": 30000
        }
      }
    }
  }
}
```

**`routes.client`** — list of route class names that require a tenant. Every request to
these routes must include `x-tenant-id` header.

**`routes.master`** — list of route class names that do NOT require a tenant. These
routes only have access to the master database.

A domain with no routes in `routes.client` and no routes in `routes.master` is registered
in the pool infrastructure but will not mount any HTTP endpoints.

### Step 2 — Register route classes in `src/modules/index.ts`

```typescript
import { SubscriptionRoute }      from './subscription/routes/SubscriptionRoute.js';
import { InvoiceRoute }           from './subscription/routes/InvoiceRoute.js';
import { SubscriptionAdminRoute } from './subscription/routes/SubscriptionAdminRoute.js';

export const routeModules = new Map<string, any>([
  // ... existing entries
  ['SubscriptionRoute',      SubscriptionRoute],
  ['InvoiceRoute',           InvoiceRoute],
  ['SubscriptionAdminRoute', SubscriptionAdminRoute],
]);
```

The string key must exactly match the name in `products.json`. Case-sensitive.

That is all. No changes to infrastructure code.

---

## 2. Writing a route class

Route classes must follow a fixed contract: **no-argument constructor**, **`route()` method
that returns an `express.Router`**, and **no database logic in the route file**.

```typescript
// src/modules/subscription/routes/SubscriptionRoute.ts
import express from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController.js';

export class SubscriptionRoute {

    route(): express.Router {
        const router = express.Router();
        const controller = new SubscriptionController();

        router.get('/subscriptions',      controller.list);
        router.get('/subscriptions/:id',  controller.get);
        router.post('/subscriptions',     controller.create);
        router.delete('/subscriptions/:id', controller.cancel);

        return router;
    }
}
```

### Rules

- Constructor takes no arguments. The platform instantiates your class as `new RouteClass()`.
- `route()` takes no arguments. Context is on the request, not injected here.
- Use standard Express methods: `router.get`, `router.post`, `router.put`, `router.patch`, `router.delete`.
- Do not create database connections, pools, or context objects in the route file.

### Route type determines tenant behaviour

If your route class is listed under `routes.client` in `products.json`:
- `x-tenant-id` header is **required** on every request
- `req.tenant`, `req.tenantId`, and `req.db.client` are populated before your controller runs
- Requests without a valid tenant header are rejected with 400 before reaching the controller

If your route class is listed under `routes.master` in `products.json`:
- No tenant header is required or expected
- `req.db.master` is available, `req.db.client` is `null`
- The route is mounted under `/admin/` prefix automatically

---

## 3. Writing a controller

Controllers receive a fully-built request object. They never construct pools or deal
with connection lifecycle.

### `req` properties available in every platform-managed route

| Property | Type | Available on |
|---|---|---|
| `req.productId` | `string` | all platform routes |
| `req.routeType` | `'client' \| 'master'` | all platform routes |
| `req.api` | `ApiRegistration \| undefined` | all platform routes |
| `req.db` | `DatabaseAccess` | all platform routes |
| `req.tenant` | `TenantInfo` | client routes only |
| `req.tenantId` | `string` | client routes only |

### Client route controller — tenant-scoped queries

```typescript
// src/modules/subscription/controllers/SubscriptionController.ts
import type { Response } from 'express';

export class SubscriptionController {

    // req.db.client queries run inside the tenant's schema automatically.
    // search_path is set to the tenant schema on every query — no manual schema handling.
    list = async (req: any, res: Response): Promise<void> => {
        try {
            const result = await req.db.client.query(
                'SELECT id, plan, status, started_at FROM subscriptions'
            );

            res.json({
                success: true,
                data: result.rows,
                tenant: req.tenantId,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    get = async (req: any, res: Response): Promise<void> => {
        try {
            const result = await req.db.client.query(
                'SELECT id, plan, status, started_at FROM subscriptions WHERE id = $1',
                [req.params.id]
            );

            if (!result.rows.length) {
                res.status(404).json({ success: false, error: 'Not found' });
                return;
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    create = async (req: any, res: Response): Promise<void> => {
        try {
            const { plan } = req.body;

            const result = await req.db.client.query(
                `INSERT INTO subscriptions (plan, status, started_at)
                 VALUES ($1, 'active', NOW())
                 RETURNING id, plan, status, started_at`,
                [plan]
            );

            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    cancel = async (req: any, res: Response): Promise<void> => {
        try {
            await req.db.client.query(
                `UPDATE subscriptions SET status = 'cancelled' WHERE id = $1`,
                [req.params.id]
            );

            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
}
```

### Master route controller — no tenant, cross-tenant reads

```typescript
export class SubscriptionAdminController {

    // Master routes use req.db.master. No tenant context.
    // req.db.client is null on master routes.
    listPlans = async (req: any, res: Response): Promise<void> => {
        try {
            const result = await req.db.master.query(
                'SELECT id, name, price, interval FROM plans WHERE active = true'
            );

            res.json({ success: true, data: result.rows });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
}
```

### Transactions

Use `withTransaction` when you need multiple queries to succeed or fail together.
The platform manages BEGIN, COMMIT, ROLLBACK, and connection release — you only
write the business logic.

```typescript
createWithAudit = async (req: any, res: Response): Promise<void> => {
    try {
        const { plan } = req.body;

        const result = await req.db.client.withTransaction(async (client) => {
            const sub = await client.query(
                `INSERT INTO subscriptions (plan, status, started_at)
                 VALUES ($1, 'active', NOW())
                 RETURNING id, plan`,
                [plan]
            );

            await client.query(
                `INSERT INTO audit_log (entity_id, action)
                 VALUES ($1, 'subscription_created')`,
                [sub.rows[0].id]
            );

            return sub.rows[0];
        });

        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        // withTransaction already rolled back
        res.status(500).json({ success: false, error: error.message });
    }
};
```

### Cross-tenant access (advanced)

Only needed when a single request must read data from a specific tenant that is not
the one from the header. Use sparingly — normal client routes should never need this.

```typescript
getDataForSpecificTenant = async (req: any, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;

        // withTenant() resolves the schema by convention: tenant_<id>
        // To use the DB-resolved schema, resolve the tenant first via master.
        const tenantAccess = req.db.withTenant(tenantId);

        const result = await tenantAccess.client.query(
            'SELECT id, email FROM users'
        );

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
```

---

## 4. What is on `req.api`

After the platform middleware runs, `req.api` contains the matched API registration:

```typescript
req.api = {
    id:      'subscription_management.subscriptions.list',
    method:  'GET',
    path:    '/subscriptions',
    product: 'subscription_management',
    type:    'client',
    tenant:  true,
}
```

This is useful for logging, rate limiting per-API, and audit trails. You do not need
to set it — the platform populates it automatically by matching the incoming request
path against the registered routes at request time.

If `req.api` is `undefined`, the request did not match any registered route. This should
not happen for routes managed by the platform; it can only occur if a route is mounted
outside the platform system.

---

## 5. How tenant isolation works

You do not need to manage schema names, `SET search_path`, or tenant validation.
The platform does all of it before your controller runs.

**What the platform does per client request:**

```
1. Read x-tenant-id header
2. Query master DB: SELECT id, schema, name FROM tenants WHERE id = $1 AND is_active = true
3. If not found → 400, request stops
4. If tenant.isActive === false → 403, request stops
5. Open connection from client pool
6. BEGIN
7. SET LOCAL search_path TO "tenant_abc"   ← scoped to this transaction only
8. Set req.tenant, req.tenantId, req.db
9. Hand off to your controller
10. Controller queries run inside tenant_abc schema
11. COMMIT / ROLLBACK
12. Connection returned to pool — search_path reset automatically
```

`SET LOCAL` means the schema setting is transaction-scoped. When the connection is
returned to the pool it carries no state from the previous request. This is what
prevents one tenant's data from leaking to another.

**What your controller must not do:**

```typescript
// ❌ Do not set search_path manually
await req.db.client.query(`SET search_path TO some_schema`);

// ❌ Do not reference schemas in queries
await req.db.client.query(`SELECT * FROM tenant_001.users`);

// ❌ Do not access another domain's database
const iamDb = platform.getDatabase('identity_access_management'); // not available in controllers
```

---

## 6. Request flow — end to end

```
POST /api/subscriptions
  x-tenant-id: acme-corp

  ↓ Express receives request
  ↓ App-level middleware (helmet, cors, rate-limit, request-id, json, etc.)
  ↓ platform.autoRegister() router mounted at /api
      ↓ req.productId = 'subscription_management'
      ↓ req.routeType = 'client'
      ↓ req.api = { id: 'subscription_management.subscriptions.create', ... }
      ↓ req.requiresTenant = true
      ↓ TenantMiddleware.resolve
          → reads x-tenant-id: acme-corp
          → queries subscription_management master DB for tenant 'acme-corp'
          → resolves schema: 'tenant_acme'
          → sets req.tenant = { id: 'acme-corp', schema: 'tenant_acme', ... }
          → sets req.db.client = connection with SET LOCAL search_path = 'tenant_acme'
      ↓ TenantMiddleware.validate
          → checks req.tenant exists
          → checks req.tenant.isActive !== false
      ↓ SubscriptionController.create runs
          → req.db.client.query('INSERT INTO subscriptions ...') 
             executes in tenant_acme schema
      ↓ Response sent
      ↓ Connection released, search_path reset
```

---

## 7. Calling the platform directly (outside controllers)

The platform is available on `context.platform` after startup (set in `app.ts`).
For admin use cases that need raw database access outside the request cycle:

```typescript
// Direct database access — for scripts, migrations, admin tools
const db = context.platform.getDatabase('subscription_management');

// Master DB — no tenant
const plans = await db.master.query('SELECT * FROM plans');

// Client DB for a specific tenant (uses convention schema: tenant_<id>)
const tenantDb = db.withTenant('acme-corp');
const users = await tenantDb.client.query('SELECT * FROM users');
```

---

## 8. Pool configuration reference

Each role in `products.json` accepts a `pool` object:

| Field | Default | Description |
|---|---|---|
| `maxConnections` | 20 | Max connections in the pool |
| `idleTimeout` | 30000 | Close idle connections after N ms |
| `connectionTimeout` | 5000 | Fail if connection not acquired in N ms |
| `maxUses` | 7500 | Retire a connection after N queries |
| `keepAlive` | true | Send TCP keepalive pings |
| `keepAliveInitialDelay` | 10000 | Delay before first keepalive ping |
| `statementTimeout` | 30000 | Cancel statement if it runs longer than N ms |
| `queryTimeout` | 30000 | Cancel query if it runs longer than N ms |

Master databases typically have lower `maxConnections` (20–30) since they handle
tenant lookups and admin operations. Client databases can be higher (30–50) since
they handle the bulk of application traffic.

---

## 9. Admin endpoints

The admin module exposes management endpoints. These are mounted at `/admin` by the
application (not by the platform auto-register).

| Endpoint | Description |
|---|---|
| `GET /admin/health` | Health status of all pools |
| `GET /admin/health/ready` | Readiness probe |
| `GET /admin/health/live` | Liveness probe |
| `GET /admin/pools` | Stats for all active pools |
| `GET /admin/pools/:productId/:role` | Stats for a specific pool |
| `PUT /admin/pools/:productId/:role` | Update pool config at runtime |
| `GET /admin/queries` | Recent query log |
| `GET /admin/queries/stats/:productId?/:role?` | Query statistics |
| `DELETE /admin/queries` | Clear query log |
| `GET /admin/leaks` | Connection leak report |
| `GET /admin/products/all` | All registered products |
| `GET /admin/products/:productId` | Single product config |
| `GET /admin/tenants/:productId` | All tenants for a product |
| `GET /admin/tenants/:productId/:tenantId` | Single tenant |
| `POST /admin/tenants` | Create a tenant |
| `PUT /admin/tenants/:productId/:tenantId` | Update a tenant |

---

## 10. Common mistakes

**Route class has a constructor parameter**

```typescript
// ❌ Platform cannot instantiate this
export class UserRoute {
    constructor(private context: any) {}
    route() { ... }
}

// ✅ No constructor args
export class UserRoute {
    route() { ... }
}
```

**Route class name in `products.json` doesn't match the Map key**

```json
// products.json
"routes": { "client": ["userRoute"] }
```
```typescript
// index.ts
routeModules.set('UserRoute', UserRoute)  // key is 'UserRoute', not 'userRoute'
```
The platform will warn at startup: `⚠️ Route class "userRoute" not found in module registry`
and skip the route silently. Check casing.

**Querying master DB from a client route controller**

```typescript
// ❌ master is available but should only be used for cross-domain lookups
// that the domain explicitly owns. Don't use it for your business data.
const result = await req.db.master.query('SELECT * FROM users');

// ✅ client is scoped to the tenant already
const result = await req.db.client.query('SELECT * FROM users');
```

**Not releasing a manually acquired connection**

```typescript
// If you use getConnection() directly, you must release it in a finally block
const conn = await req.db.client.getConnection();
try {
    await conn.query('...');
} finally {
    conn.release();  // ← required, or you leak the connection
}

// Prefer withTransaction() which handles this for you
await req.db.client.withTransaction(async (conn) => {
    await conn.query('...');
});
```

**Adding credentials to code**

All database credentials live in `products.json` only. Controllers, routes, and
services must never contain connection strings, usernames, passwords, or host names.
