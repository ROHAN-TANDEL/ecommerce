// src/app.ts
import express from 'express';
import { createPlatformContext } from './platform/context.js';
import { routeModules } from './modules/index.js';
import { AdminRoute } from './modules/admin/routes/AdminRoute.js';

const app = express();
app.use(express.json());

// Create platform
const platform = createPlatformContext(routeModules);

// Auto-register all routes from config
app.use('/api', platform.autoRegister());

// Admin routes for pool management
const adminRoute = new AdminRoute(platform);
app.use('/admin', adminRoute.route());

// Health check
app.get('/health', (req, res) => {
    const stats = platform.database.getPoolStats();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        pools: stats,
        poolCount: stats.length
    });
});

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
});