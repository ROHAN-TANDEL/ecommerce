import express from 'express';
import UserController from '../controllers/UserController.js';

export class RoleRoute {

    route(): express.Router {
        const router = express.Router();
        const controller = new UserController();

        // Roles management placeholder — expand as needed
        router.get('/roles', controller.listUsers);

        return router;
    }
}
