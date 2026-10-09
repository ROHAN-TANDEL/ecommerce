import express from "express";
import multer from "multer";
import { EmployeeController } from "../controller/EmployeeController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class EmployeeRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(EmployeeController);

        // ── Configurations ──
        router.get('/employees/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/employees/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/employees/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/employees/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/employees/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/employees', ctrl.list.bind(ctrl));
        router.get('/employees/:id', ctrl.get.bind(ctrl));
        router.post('/employees/create', ctrl.create.bind(ctrl));
        router.post('/employees/create/all', ctrl.createAll.bind(ctrl));
        router.post('/employees/create/import', upload.single('file'), ctrl.importCreate.bind(ctrl));
        router.put('/employees/update/:id', ctrl.update.bind(ctrl));
        router.put('/employees/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/employees/update/import', upload.single('file'), ctrl.importUpdate.bind(ctrl));
        router.delete('/employees/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/employees/delete/all', ctrl.deleteAll.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/employees/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/employees/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
