import express from "express";
import ProductController from "./ProductController.js";
import ProductMiddleware from "./ProductMiddleware.js";

export default class ProductRoute {

    context;

    constructor(context) {
        this.context = context;
    }

    route(context) {

        const route = express.Router();

        const register = express.Router();

        const productController = new ProductController(context);

        const authMid = new ProductMiddleware(context).auth;

        route.use(authMid);

        route.get('', productController.getProducts);

        route.get('/:id', productController.getProduct);

        route.post('/', productController.createProduct);

        route.post('/:id', productController.updateProduct);

        route.delete('/:id', productController.deleteProduct);

        register.use('/products', route);

        return register;
    }
}
//# sourceMappingURL=ProductRoute.js.map