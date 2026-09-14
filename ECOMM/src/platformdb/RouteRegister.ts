import { Pool, type PoolConfig } from "pg";
import { api } from "../routes/api.js";
import express from "express";
import clientContext from "./request-context-middleware.js";
import Config from "./config.js";
import { facadeMiddleware } from "./facade-middleware.js";

export default class RouteRegister {

    private routers:any = [];

    constructor(private readonly pools:any) {
        const config = this.config();
        this.register(config);
    }

    private config() : any
    {
        return new Config().config();
    }

    private register(config:any) : any
    {

        for (const [productName, productDetail] of Object.entries(config))
        {
            const databases = Object.keys(productDetail['database']);
            const dbs = {};

            for (const databaseRole of databases) {

                let poolKey;

                const databaseConfig : any = productDetail['database'][databaseRole];

                if (databaseConfig.status) {

                    if (databaseConfig.roles?.master !== true && databaseConfig.roles?.client !== true) {
                        poolKey = `${productName}:${databaseRole}`;
                        dbs[databaseRole] = this.pools.get(poolKey);
                    }

                    if (databaseConfig.roles?.master === true) {
                        poolKey = `${productName}:master`;
                        dbs['master'] = this.pools.get(poolKey);
                    }

                    if (databaseConfig.roles?.client === true) {
                        poolKey = `${productName}:client`;
                        dbs['client'] = this.pools.get(poolKey);
                    }
                }
            }

            const routes:any = productDetail.routes;

            for (const routeName of routes)
            {
                const router = express.Router();

                const routerData = api[routeName];
                console.log("router name");
                console.log(api, routeName, routerData);

                if (routerData !== undefined) {
                    const registerRoute = (new routerData()).route(dbs);

                    router.use(productDetail.identification, clientContext, facadeMiddleware(dbs), registerRoute);

                    this.routers.push(router);
                } else {
                    console.log("route not defined " . routerData);
                }
            }
        }
        return this.routers;
    }

    public routes()
    {
        return this.routers;
    }
}