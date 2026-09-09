import express from 'express';
import UserController from '../controllers/UserController.js';

export class AuditRoute {

    route(): express.Router {
        const router = express.Router();
        const controller = new UserController();

        // List tenants (master-level, no tenant context)
        router.get('/tenants', controller.listTenants);

        return router;
    }
}
