// src/app.ts
import express from 'express';
import { createPlatformContext } from './platform/context.js';
import { routeModules } from './modules/index.js';

const app = express();
app.use(express.json());

// Create platform with route modules
const platform = createPlatformContext(routeModules);

// Log initial pool status
console.log('\n📊 Initial Pool Status:');
platform.database.logPoolStatus();

// Auto-register all routes
app.use('/api', platform.autoRegister());

// Health check endpoint with pool status
app.get('/health', (req, res) => {
    const stats = platform.database.getPoolStats();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        pools: stats,
        products: platform.products.getEnabledProducts().map(p => ({
            id: p.id,
            routes: p.routes,
            roles: Object.keys(p.roles).filter(r => p.roles[r].enabled)
        }))
    });
});

// Admin endpoint for pool status
app.get('/admin/pools', (req, res) => {
    const stats = platform.database.getPoolStats();
    res.json({
        success: true,
        data: stats
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
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Pool status: http://localhost:${PORT}/admin/pools`);
});