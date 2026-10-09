import express from "express";
import multer from "multer";
import { CustomerController } from "../controller/CustomerController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class CustomerRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(CustomerController);

        // ── Configurations ──
        router.get('/customers/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/customers/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/customers/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/customers/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/customers/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/customers', ctrl.list.bind(ctrl));
        router.get('/customers/:id', ctrl.get.bind(ctrl));
        router.post('/customers/create', ctrl.create.bind(ctrl));
        router.post('/customers/create/all', ctrl.createAll.bind(ctrl));
        router.post('/customers/create/import', upload.single('file'), ctrl.importCreate.bind(ctrl));
        router.put('/customers/update/:id', ctrl.update.bind(ctrl));
        router.put('/customers/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/customers/update/import', upload.single('file'), ctrl.importUpdate.bind(ctrl));
        router.delete('/customers/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/customers/delete/all', ctrl.deleteAll.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/customers/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/customers/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
