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

        // ── Table Configurations ──
        router.get('/customers/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/customers/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/customers/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/customers/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/customers/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/customers', ctrl.list.bind(ctrl));
        router.post('/customers', ctrl.list.bind(ctrl));
        router.get('/customers/:id', ctrl.get.bind(ctrl));
        router.post('/customers/create', ctrl.create.bind(ctrl));
        router.post('/customers/create/all', ctrl.createAll.bind(ctrl));
        router.post('/customers/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/customers/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/customers/update/:id', ctrl.update.bind(ctrl));
        router.post('/customers/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/customers/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/customers/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/customers/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/customers/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/customers/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/customers/lock', ctrl.getLocks.bind(ctrl));
        router.post('/customers/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/customers/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/customers/export', ctrl.exportData.bind(ctrl));
        router.post('/customers/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/customers/view/list', ctrl.listViews.bind(ctrl));
        router.post('/customers/view/create', ctrl.saveView.bind(ctrl));
        router.post('/customers/view/save', ctrl.saveView.bind(ctrl));
        router.get('/customers/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/customers/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/customers/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/customers/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/customers/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/customers/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/customers/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/customers/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/customers/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
