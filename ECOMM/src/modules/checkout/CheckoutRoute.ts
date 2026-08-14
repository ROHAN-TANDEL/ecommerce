import express from "express";
import CheckoutController from "./CheckoutController.js";
import AuthMiddleware from "../auth/AuthMiddleware.js";

export default class CheckoutRoute {

    constructor(private readonly context:any) {
    }

    public route= () => {

        const route = express.Router();

        const register = express.Router();

        const coController = new CheckoutController(this.context);
        const authMid = new AuthMiddleware(this.context).auth;

        route.use(authMid);

        route.get('/cart',  coController.getCart);

        route.post('/cart/items',  coController.addCartItem);

        route.patch('/cart/items/:id', coController.updateCartItem);

        route.delete('/cart/items/:id', coController.deleteCartItem);

        route.delete('/cart', coController.deleteCart);

        route.post('/checkout', coController.checkout, coController.deleteCart);

        register.use(route);

        return register;
    }
}