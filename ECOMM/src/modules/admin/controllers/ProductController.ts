// src/modules/admin/controllers/ProductController.ts
import { Request, Response } from 'express';
import { PlatformContext } from '../../../platform/context.js';
import { ProductDefinition, RoleConfig } from '../../../platform/config/ProductConfig.js';

export class ProductController {
    constructor(private platform: PlatformContext) {}

    /**
     * Get all products
     */
    getAllProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = this.platform.products.getEnabledProducts();
            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get product by ID
     */
    getProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId } = req.params;
            const product = this.platform.products.getProduct(productId);

            if (!product) {
                res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
                return;
            }

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Error in getProduct:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Add a new product dynamically
     */
    addProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const product: ProductDefinition = req.body;

            // Validate
            if (!product.id || !product.name) {
                res.status(400).json({
                    success: false,
                    error: 'Product requires id and name'
                });
                return;
            }

            // Add product
            this.platform.products.addProduct(product);

            res.status(201).json({
                success: true,
                message: 'Product added successfully',
                data: product
            });
        } catch (error) {
            console.error('Error in addProduct:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Add a role to a product dynamically
     */
    addRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId } = req.params;
            const { roleName, roleConfig } = req.body;

            if (!roleName || !roleConfig) {
                res.status(400).json({
                    success: false,
                    error: 'roleName and roleConfig are required'
                });
                return;
            }

            this.platform.products.addRole(productId, roleName, roleConfig);

            res.json({
                success: true,
                message: `Role "${roleName}" added to product "${productId}"`,
                data: { productId, roleName, roleConfig }
            });
        } catch (error) {
            console.error('Error in addRole:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Toggle role enabled/disabled
     */
    toggleRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, roleName } = req.params;
            const { enabled } = req.body;

            if (enabled === undefined) {
                res.status(400).json({
                    success: false,
                    error: 'enabled is required'
                });
                return;
            }

            this.platform.products.setRoleEnabled(productId, roleName, enabled);

            res.json({
                success: true,
                message: `Role "${roleName}" ${enabled ? 'enabled' : 'disabled'}`
            });
        } catch (error) {
            console.error('Error in toggleRole:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get product configuration
     */
    getConfig = async (req: Request, res: Response): Promise<void> => {
        try {
            this.platform.products.logConfig();
            res.json({
                success: true,
                message: 'Configuration logged to console'
            });
        } catch (error) {
            console.error('Error in getConfig:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    /**
     * Get product routes
     */
    getProductRoutes = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId } = req.params;
            const product = this.platform.products.getProduct(productId);

            if (!product) {
                res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
                return;
            }

            const routes = product.routes.map(routeName => ({
                name: routeName,
                productId: productId
            }));

            res.json({
                success: true,
                data: routes
            });
        } catch (error) {
            console.error('Error in getProductRoutes:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };
}