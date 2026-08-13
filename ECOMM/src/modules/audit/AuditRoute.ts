import express from "express";
import AuditController from "./AuditController.js";
import AuthMiddleware from "../auth/AuthMiddleware.js";

export default class CheckoutRoute {

    constructor(private readonly context:any) {
    }

    public route= () => {

        const route = express.Router();

        const register = express.Router();

        const auditControl = new AuditController(this.context);

        const authMid = new AuthMiddleware(this.context).auth;

        route.use(authMid);

        route.get('/audit',  auditControl.getAuditLogs);

        route.get('/audit/:id',  auditControl.getAuditLog);

        register.use('/api',route);

        return register;
    }
}