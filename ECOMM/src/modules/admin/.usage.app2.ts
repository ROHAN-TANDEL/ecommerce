// src/app.ts
import express from 'express';
import { createPlatformContext } from './platform/context.js';
import { routeModules } from './modules/index.js';
import { AdminRoute } from './modules/admin/routes/AdminRoute.js';

const app = express();
app.use(express.json());

const platform = createPlatformContext(routeModules);

// Health endpoints
app.get('/health', async (req, res) => {
    const health = await platform.health.check();
    const stats = platform.database.getPoolStats();
    const queryStats = platform.queries.getStats();

    res.json({
        status: health.healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        health: health,
        pools: stats,
        queries: queryStats
    });
});

app.get('/health/ready', async (req, res) => {
    const ready = await platform.health.ready();
    res.status(ready ? 200 : 503).json({ ready });
});

app.get('/health/live', (req, res) => {
    const live = platform.health.live();
    res.status(live ? 200 : 503).json({ live });
});

// Auto-register routes
app.use('/api', platform.autoRegister());

// Admin routes
const adminRoute = new AdminRoute(platform);
app.use('/admin', adminRoute.route());

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await platform.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await platform.close();
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin/pools`);
    console.log(`📊 Query Logs: http://localhost:${PORT}/admin/queries`);
    console.log(`📊 Leak Detection: http://localhost:${PORT}/admin/leaks`);
});