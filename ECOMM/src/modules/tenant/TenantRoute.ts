import express from "express";
import TenantController from "./TenantController.js";

export default class TenantRoute {

    constructor(private readonly context: any) {}

    route(context: any) {
        const router   = express.Router();
        const tenants  = express.Router();
        const ctrl     = new TenantController(context);

        tenants.post(  "/an",    ctrl.create);
        tenants.get(   "/",    ctrl.list);
        tenants.get(   "/:id", ctrl.get);

        router.use("/tenants", tenants);

        return router;
    }
}
