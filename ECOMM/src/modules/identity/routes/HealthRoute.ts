import express from "express";

import { HealthController } from "../controller/HealthController.js";

export class HealthRoute {

    constructor(private readonly context:any) {
    }

    route = (dbs) => {

        const router = express.Router();

        const controller = app(HealthController);

        router.get("/health", controller.check.bind(controller));

        return router;

    }
}