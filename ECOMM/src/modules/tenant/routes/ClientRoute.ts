import express from "express";

import { ClientController } from "../controller/ClientController.js";

export class ClientRoute {

    constructor() {}

    route = () => {

        const router = express.Router();

        const controller = app(ClientController);

        router.get("/client/register", controller.createClient.bind(controller));

        return router;

    }
}