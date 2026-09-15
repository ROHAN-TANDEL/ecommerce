import express from "express";

import {createContainer, asClass, asValue } from "awilix";

export class HealthRoute {

    constructor(private readonly context:any) {}

    route = (dbs) => {

        const router = express.Router();

        const controller = app("healthController");

        router.get("/health", controller.check.bind(controller));

        return router;

    }
}