import express from "express";
import AuthController from "./AuthController.js";
import AuthMiddleware from "./AuthMiddleware.js";

export default class AuthRoute {

    context;

    constructor(context:any) {
        this.context = context;
    }

    route(context:any) {

        const auth = express.Router();

        const authRouter = express.Router();

        const authController = new AuthController(context);

        const authMid = new AuthMiddleware(context).auth;

        auth.route('/auth');

        auth.get('/ping', authController.ping);

        auth.post('/register', authController.register);

        auth.post('/login', authController.login);

        auth.post('/refresh-token', authController.refreshToken);

        auth.post('/logout', authMid, authController.logout);

        authRouter.use('/auth', auth);

        return authRouter;
    }
}
//# sourceMappingURL=AuthRoute.js.map