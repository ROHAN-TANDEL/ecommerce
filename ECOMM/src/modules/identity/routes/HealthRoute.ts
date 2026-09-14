import express from "express";

import {createContainer, asClass, asValue } from "awilix";

import { HealthRepository } from "../repository/HealthRepository.js";
import { HealthService } from "../service/HealthService.js";
import { HealthValidator } from "../validator/HealthValidator.js";
import { HealthResponse } from "../response/HealthResponse.js";
import { HealthController } from "../controller/HealthController.js";

export class HealthRoute {

    constructor(private readonly context:any) {
    }

    route = (dbs) => {

        const router = express.Router();

        const container = createContainer();

        container.register({
            healthRepository: asClass(HealthRepository),
            healthService: asClass(HealthService),
            healthValidator: asClass(HealthValidator),
            healthResponse: asClass(HealthResponse),
            healthController: asClass(HealthController)
        });

        const controller:any = container.resolve("healthController");

        router.get("/health", controller.check.bind(controller));

        return router;

    }
}