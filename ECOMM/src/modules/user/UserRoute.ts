import express from "express";
import UserController from "./UserController.js";
import AuthMiddleware from "../auth/AuthMiddleware.js";
export default class UserRoute {

    route(context: any) {

        const userRoute = express.Router();

        const userRouter = express.Router();

        const userController = new UserController(context);

        userRoute.get('/:id', userController.getUser);

        userRoute.get('/', userController.getUsers);

        userRoute.delete('/:id', userController.deleteUser);

        userRoute.post('/:id', userController.updateUser);

        userRouter.use('/users', userRoute);

        return userRouter;
    }
}
//# sourceMappingURL=UserRoute.js.map