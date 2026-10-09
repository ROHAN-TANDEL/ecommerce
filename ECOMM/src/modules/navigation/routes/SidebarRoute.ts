import express from "express";
import { SidebarController } from "../controller/SidebarController.js";

export class SidebarRoute {

    private controller: SidebarController;

    constructor(controller?: any) {
        if (controller) {
            this.controller = controller;
        } else if (typeof (globalThis as any).app === "function") {
            try {
                this.controller = (globalThis as any).app(SidebarController) || new SidebarController();
            } catch {
                this.controller = new SidebarController();
            }
        } else {
            this.controller = new SidebarController();
        }
    }

    route = (_dbs?: any) => {
        const router = express.Router();
        const ctrl = this.controller;

        /**
         * @route   GET / OR GET /config OR GET /sidebar OR GET /sidebar/config
         * @desc    Get sidebar navigation configuration
         */
        router.get('/', ctrl.getSidebarConfig.bind(ctrl));
        router.get('/config', ctrl.getSidebarConfig.bind(ctrl));
        router.get('/sidebar', ctrl.getSidebarConfig.bind(ctrl));
        router.get('/sidebar/config', ctrl.getSidebarConfig.bind(ctrl));

        /**
         * @route   GET /sections OR GET /sidebar/sections
         * @desc    Get navigation sections configuration
         */
        router.get('/sections', ctrl.getSections.bind(ctrl));
        router.get('/sidebar/sections', ctrl.getSections.bind(ctrl));

        /**
         * @route   GET /items OR GET /sidebar/items
         * @desc    Get all navigation items or filtered by ?section=section_1
         */
        router.get('/items', ctrl.getItems.bind(ctrl));
        router.get('/sidebar/items', ctrl.getItems.bind(ctrl));

        /**
         * @route   GET /items/:key OR GET /sidebar/items/:key
         * @desc    Get a specific item by key (e.g., users, clients, partners)
         */
        router.get('/items/:key', ctrl.getItem.bind(ctrl));
        router.get('/sidebar/items/:key', ctrl.getItem.bind(ctrl));

        /**
         * @route   GET /grouped OR GET /sidebar/grouped
         * @desc    Get navigation tree grouped by section with nested items
         */
        router.get('/grouped', ctrl.getGroupedConfig.bind(ctrl));
        router.get('/sidebar/grouped', ctrl.getGroupedConfig.bind(ctrl));

        return router;
    };
}
