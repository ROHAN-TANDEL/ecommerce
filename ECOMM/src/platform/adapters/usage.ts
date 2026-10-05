import express from 'express';
import { Database } from './infra/database/pgsql';
import { platform } from './platform/factory';
import { ApiRegistrar } from './platform/api-registrar';
import { DomainApiRegistry } from './platform/domain-api-registry';
import domains from './config/domains';

// ============================================================
// 1. Your existing code - UNCHANGED
// ============================================================

const app = express();

// Your existing middleware
app.use(express.json());

// Your existing routes
const router = express.Router();
router.get('/users/:id', userController.getUser);
router.post('/tenants', tenantController.createTenant);
// ... etc

// ============================================================
// 2. NEW: Initialize platform with your existing Database
// ============================================================

const database = new Database(domains);  // Your existing Database

// Initialize platform (wraps your database without modifying it)
const components = platform.initialize(database);

// Get platform components
const { apiRegistry, apiMiddleware, errorHandler } = components;

// ============================================================
// 3. NEW: Register all APIs
// ============================================================

const registrar = new ApiRegistrar(apiRegistry);
const domainRegistry = new DomainApiRegistry(registrar);

// Register all domain APIs
domainRegistry.registerAll();

// Or register individually:
// domainRegistry.registerIAMAPIs();

// ============================================================
// 4. NEW: Add platform middleware (runs BEFORE routes)
// ============================================================

app.use(apiMiddleware.getHandler());

// ============================================================
// 5. Your existing routes - STILL UNCHANGED
// ============================================================

app.use('/api', router);

// ============================================================
// 6. NEW: Enhanced error handling (optional)
// ============================================================

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const formatted = errorHandler.handle(error);
    res.status(400).json(formatted);
});

// ============================================================
// 7. Your existing server startup - UNCHANGED
// ============================================================

const server = app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Platform initialized with API registry');
    console.log('Registered APIs:', apiRegistry.getMetrics());
});

// Graceful shutdown (enhanced)
process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    server.close(async () => {
        await database.close();  // Your existing database close
        process.exit(0);
    });
});

export { app, database, apiRegistry };