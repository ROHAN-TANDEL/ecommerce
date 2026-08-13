import express from "express";
import OrderController from "./OrderController.js";
import AuthMiddleware from "../auth/AuthMiddleware.js";

export default class CheckoutRoute {

    constructor(private readonly context:any) {
    }

    public route= () => {

        const route = express.Router();

        const register = express.Router();

        const orderControl = new OrderController(this.context);

        const authMid = new AuthMiddleware(this.context).auth;

        route.use(authMid);

        route.get('/orders',  orderControl.getOrders);

        route.get('/orders/:id',  orderControl.getOrder);

        route.get('/orders/user/:userId',  orderControl.getUserOrders);

        register.use('/api',route);

        return register;
    }
}