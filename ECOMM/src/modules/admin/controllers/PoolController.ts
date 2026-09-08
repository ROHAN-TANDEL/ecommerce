// src/modules/admin/controllers/PoolController.ts
import { Request, Response } from 'express';
import { PlatformContext } from '../../../platform/context.js';

export class PoolController {
    constructor(private platform: PlatformContext) {}

    /**
     * Get all pool status
     */
    getAllPoolStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = this.platform.database.getPoolStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error in getAllPoolStatus:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get pool info for specific product/role
     */
    getPoolInfo = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, role } = req.params;
            const info = this.platform.database.getPoolInfo(productId, role);

            if (!info) {
                res.status(404).json({
                    success: false,
                    error: 'Pool not found'
                });
                return;
            }

            res.json({
                success: true,
                data: info
            });
        } catch (error) {
            console.error('Error in getPoolInfo:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Update pool configuration
     */
    updatePoolConfig = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, role } = req.params;
            const config = req.body;

            await this.platform.database.updatePoolConfig(productId, role, config);

            res.json({
                success: true,
                message: 'Pool configuration updated successfully',
                data: config
            });
        } catch (error) {
            console.error('Error in updatePoolConfig:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Log pool status
     */
    logPoolStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            this.platform.database.logPoolStatus();
            res.json({
                success: true,
                message: 'Pool status logged to console'
            });
        } catch (error) {
            console.error('Error in logPoolStatus:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get query logs
     */
    getQueryLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const productId = req.query.productId as string;
            const role = req.query.role as string;
            const slow = req.query.slow === 'true';

            const filter: any = {};
            if (productId) filter.productId = productId;
            if (role) filter.role = role;
            if (slow !== undefined) filter.slow = slow;

            const logs = this.platform.queries.getLogs(limit, filter);

            res.json({
                success: true,
                data: logs,
                count: logs.length
            });
        } catch (error) {
            console.error('Error in getQueryLogs:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get query statistics
     */
    getQueryStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, role } = req.params;
            const stats = this.platform.queries.getStats(productId, role);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error in getQueryStats:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Clear query logs
     */
    clearQueryLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            this.platform.queries.clearLogs();
            res.json({
                success: true,
                message: 'Query logs cleared successfully'
            });
        } catch (error) {
            console.error('Error in clearQueryLogs:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get leak information
     */
    getLeakInfo = async (req: Request, res: Response): Promise<void> => {
        try {
            const leaks = this.platform.leaks.getInfo();
            const hasLeaks = this.platform.leaks.hasLeaks();

            res.json({
                success: true,
                data: {
                    hasLeaks,
                    leaks,
                    totalLeaks: Object.values(leaks).reduce((sum, count) => sum + count, 0)
                }
            });
        } catch (error) {
            console.error('Error in getLeakInfo:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Health check
     */
    healthCheck = async (req: Request, res: Response): Promise<void> => {
        try {
            const health = await this.platform.health.check();
            const isReady = await this.platform.health.ready();
            const isLive = this.platform.health.live();

            res.json({
                success: true,
                data: {
                    status: health.healthy ? 'healthy' : 'unhealthy',
                    ready: isReady,
                    live: isLive,
                    pools: health.pools,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in healthCheck:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };
}