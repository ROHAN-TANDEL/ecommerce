// src/app.ts
import express from 'express';

import { routeModules } from './modules/index.js';
import { AdminRoute } from './modules/admin/routes/AdminRoute.js';
import { createPlatformContext } from './platform/context.js';

const app = express();
app.use(express.json());

const platform = createPlatformContext(routeModules);

// Log initial configuration
platform.products.logConfig();

// Auto-register all routes from config
app.use('/api', platform.autoRegister());

// Admin routes for dynamic management
const adminRoute = new AdminRoute(platform);
app.use('/admin', adminRoute.route());

// Health check
app.get('/health', async (req, res) => {
    const health = await platform.health.check();
    const stats = platform.database.getPoolStats();
    const queryStats = platform.queries.getStats();

    res.json({
        status: health.healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        products: platform.products.getEnabledProducts().map(p => p.id),
        pools: stats.length,
        queries: queryStats
    });
});

// Example: Dynamic product addition endpoint
app.post('/admin/products/dynamic', async (req, res) => {
    try {
        const productData = req.body;

        // Add product dynamically
        platform.products.addProduct(productData);

        // Re-register routes if needed
        // This would require route reload logic

        res.json({
            success: true,
            message: 'Product added dynamically',
            data: productData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
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
    console.log(`📊 Admin Products: http://localhost:${PORT}/admin/products`);
    console.log(`\n✅ To add a new product, POST to /admin/products`);
    console.log(`✅ To add a new role, POST to /admin/products/{productId}/roles`);
});