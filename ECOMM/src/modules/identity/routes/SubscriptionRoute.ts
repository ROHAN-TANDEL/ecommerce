import express from "express";
import UserController from "../controllers/UserController.js";

export default class UserRoute {


    context;

    constructor(context) {
        this.context = context;
    }

    route(context) {

        const userRoute = express.Router();

        const userRouter = express.Router();

        const userController = new UserController(context);

        userRoute.get('/:id', authMid, userController.getUser);

        userRoute.get('/', userController.getUsers);

        userRoute.delete('/:id', userController.deleteUser);

        userRoute.post('/:id', userController.updateUser);

        userRouter.use('/users', userRoute);

        return userRouter;
    }
}
//# sourceMappingURL=UserRoute.js.map