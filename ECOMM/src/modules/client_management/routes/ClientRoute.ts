import express from "express";
import multer from "multer";
import { ClientController } from "../controller/ClientController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class ClientRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(ClientController);

        // ── Table Configurations ──
        router.get('/clients/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/clients/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/clients/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/clients/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/clients/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/clients', ctrl.getClients.bind(ctrl));
        router.post('/clients', ctrl.getClients.bind(ctrl));
        router.get('/clients/:id', ctrl.get.bind(ctrl));
        router.post('/clients/create', ctrl.create.bind(ctrl));
        router.post('/clients/create/all', ctrl.createAll.bind(ctrl));
        router.post('/clients/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/clients/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/clients/update/:id', ctrl.update.bind(ctrl));
        router.post('/clients/update/status', ctrl.updateStatus.bind(ctrl));
        router.post('/clients/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/clients/update/bulk/status', ctrl.updateBulkStatus.bind(ctrl));
        router.post('/clients/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/clients/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/clients/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/clients/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/clients/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/clients/lock', ctrl.getLocks.bind(ctrl));
        router.post('/clients/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/clients/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/clients/export', ctrl.exportData.bind(ctrl));
        router.post('/clients/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/clients/view/list', ctrl.listViews.bind(ctrl));
        router.post('/clients/view/create', ctrl.saveView.bind(ctrl));
        router.post('/clients/view/save', ctrl.saveView.bind(ctrl));
        router.get('/clients/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/clients/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/clients/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/clients/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/clients/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/clients/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/clients/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/clients/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/clients/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
