import express from "express";

import { HealthController } from "../controller/HealthController.js";

export class HealthRoute {

    constructor(private readonly context:any) {
    }

    route = (dbs) => {

        const router = express.Router();

        const controller = app(HealthController);

        router.get("/health", controller.check.bind(controller));

        router.get("/customers", controller.getCustomers.bind(controller));

        router.get("/seed/customers", controller.seedCustomers.bind(controller));

        router.get("/customers/config", controller.getCustomerConfig.bind(controller));

        router.get("/customers/table-config", controller.getCustomerTableConfig.bind(controller));

        return router;

    }
}