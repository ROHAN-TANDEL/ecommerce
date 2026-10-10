import express from "express";
import multer from "multer";
import { ClientProductController } from "../controller/ClientProductController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class ClientProductRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(ClientProductController);

        // ── Table Configurations ──
        router.get('/client_products/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/client_products/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/client_products/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/client_products/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/client_products/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/client_products', ctrl.getClientproducts.bind(ctrl));
        router.post('/client_products', ctrl.getClientproducts.bind(ctrl));
        router.get('/client_products/:id', ctrl.get.bind(ctrl));
        router.post('/client_products/create', ctrl.create.bind(ctrl));
        router.post('/client_products/create/all', ctrl.createAll.bind(ctrl));
        router.post('/client_products/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/client_products/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/client_products/update/:id', ctrl.update.bind(ctrl));
        router.post('/client_products/update/status', ctrl.updateStatus.bind(ctrl));
        router.post('/client_products/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/client_products/update/bulk/status', ctrl.updateBulkStatus.bind(ctrl));
        router.post('/client_products/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/client_products/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/client_products/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/client_products/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/client_products/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/client_products/lock', ctrl.getLocks.bind(ctrl));
        router.post('/client_products/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/client_products/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/client_products/export', ctrl.exportData.bind(ctrl));
        router.post('/client_products/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/client_products/view/list', ctrl.listViews.bind(ctrl));
        router.post('/client_products/view/create', ctrl.saveView.bind(ctrl));
        router.post('/client_products/view/save', ctrl.saveView.bind(ctrl));
        router.get('/client_products/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/client_products/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/client_products/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/client_products/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/client_products/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/client_products/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/client_products/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/client_products/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/client_products/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
