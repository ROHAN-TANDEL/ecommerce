// src/modules/admin/routes/AdminRoute.ts
import express from 'express';
import { PoolController } from '../controllers/PoolController.js';
import { ProductController } from '../controllers/ProductController.js';
import { PlatformContext } from '../../../platform/context.js';

export class AdminRoute {
    private poolController: PoolController;
    private productController: ProductController;

    constructor(platform: PlatformContext) {
        this.poolController = new PoolController(platform);
        this.productController = new ProductController(platform);
    }

    public route = (): express.Router => {
        const router = express.Router();

        // ==================== POOL MANAGEMENT ====================
        router.get('/pools', this.poolController.getAllPoolStatus);
        router.get('/pools/:productId/:role', this.poolController.getPoolInfo);
        router.put('/pools/:productId/:role', this.poolController.updatePoolConfig);
        router.post('/pools/log', this.poolController.logPoolStatus);

        // ==================== PRODUCT MANAGEMENT ====================
        router.get('/products', this.productController.getAllProducts);
        router.get('/products/:productId', this.productController.getProduct);
        router.get('/products/:productId/routes', this.productController.getProductRoutes);
        router.post('/products', this.productController.addProduct);
        router.post('/products/:productId/roles', this.productController.addRole);
        router.put('/products/:productId/roles/:roleName', this.productController.toggleRole);
        router.get('/products/config/log', this.productController.getConfig);

        // ==================== HEALTH CHECKS ====================
        router.get('/health', this.poolController.healthCheck);
        router.get('/health/ready', async (req, res) => {
            const ready = await this.poolController['platform'].health.ready();
            res.status(ready ? 200 : 503).json({ ready });
        });
        router.get('/health/live', (req, res) => {
            const live = this.poolController['platform'].health.live();
            res.status(live ? 200 : 503).json({ live });
        });

        // ==================== QUERY LOGS ====================
        router.get('/queries', this.poolController.getQueryLogs);
        router.get('/queries/stats/:productId?/:role?', this.poolController.getQueryStats);
        router.delete('/queries', this.poolController.clearQueryLogs);

        // ==================== LEAK DETECTION ====================
        router.get('/leaks', this.poolController.getLeakInfo);

        return router;
    };
}