import express from "express";
import { BusinessProductController } from "../controller/BusinessProductController.js";

const router:any = express.Router();

export class BusinessProductRoute {

    route()
    {
        router.post(
            "/businesses/products",
            async (request:any, response:any) => {

                const controller:any = app(BusinessProductController);

                return controller.register(request, response);
            }
        );

        return router;
    }
}