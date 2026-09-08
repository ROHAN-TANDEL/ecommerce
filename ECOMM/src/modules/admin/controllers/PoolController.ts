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
}