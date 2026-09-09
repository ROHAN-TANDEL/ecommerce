import express from 'express';
import UserController from '../controllers/UserController.js';

export class UserRoute {

    route(): express.Router {
        const router = express.Router();
        const controller = new UserController();

        // List all users in tenant schema
        router.get('/users', controller.listUsers);

        // Create a user with audit log
        router.post('/users', controller.createUserWithAudit);

        // Get users for a specific tenant (admin/cross-tenant use)
        router.get('/users/tenant/:tenantId', controller.getUsersForTenant);

        return router;
    }
}
