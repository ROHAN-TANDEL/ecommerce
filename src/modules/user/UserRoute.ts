import express from "express";
import UserController from "./UserController.js";
import AuthMiddleware from "../auth/AuthMiddleware.js";
export default class UserRoute {


    context;

    constructor(context) {
        this.context = context;
    }

    route(context) {

        const userRoute = express.Router();

        const userRouter = express.Router();

        const userController = new UserController(context);

        const authMid = new AuthMiddleware(context).auth;

        userRoute.use(authMid);

        userRoute.get('/:id', authMid, userController.getUser);

        userRoute.get('/', userController.getUsers);

        userRoute.delete('/:id', userController.deleteUser);

        userRoute.post('/:id', userController.updateUser);

        userRouter.use('/users', userRoute);

        return userRouter;
    }
}
//# sourceMappingURL=UserRoute.js.map