import express from "express";
import { ClientController } from "../controller/ClientController.js";

const router:any = express.Router();

export class ClientRoute {

    route()
    {
        router.post(
            "/clients",
            async (request:any, response:any) => {

                const controller:any = app(ClientController);

                return controller.create(request, response);
            }
        );

        return router;
    }
}