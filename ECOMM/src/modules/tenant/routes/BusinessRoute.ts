import express from "express";
import { BusinessController } from "../controller/BusinessController.js";

const router:any = express.Router();

export class BusinessRoute {

    route()
    {
        router.post(
            "/businesses",
            async (request:any, response:any) => {

                const controller:any = app(BusinessController);

                return controller.create(request, response);
            }
        );

        return router;
    }
}