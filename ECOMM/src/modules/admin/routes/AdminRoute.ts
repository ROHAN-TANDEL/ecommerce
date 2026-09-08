// src/modules/admin/routes/AdminRoute.ts
import express from 'express';
import { PoolController } from '../controllers/PoolController.js';
import { PlatformContext } from '../../../platform/context.js';

export class AdminRoute {
    private poolController: PoolController;

    constructor(platform: PlatformContext) {
        this.poolController = new PoolController(platform);
    }

    public route = (): express.Router => {
        const router = express.Router();

        // Pool management endpoints
        router.get('/pools', this.poolController.getAllPoolStatus);
        router.get('/pools/:productId/:role', this.poolController.getPoolInfo);
        router.put('/pools/:productId/:role', this.poolController.updatePoolConfig);
        router.post('/pools/log', this.poolController.logPoolStatus);

        return router;
    };
}