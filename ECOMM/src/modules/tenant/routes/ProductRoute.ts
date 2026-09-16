import express from "express";
import { ProductController } from "../controller/ProductController.js";
import { SchemaController } from "../controller/SchemaController.js";

export class ProductRoute {

    route = () => {

        const router = express.Router();

        router.post("/products", async (request:any, response:any) => {

                const controller:any = app(ProductController);

                return controller.create(request, response);
            }
        );

        router.post("/create/schema", async (request:any, response:any) => {

            console.log("testing");
                const controller:any = app(SchemaController);

                return controller.create(request, response);
            }
        );

        return router;
    }
}