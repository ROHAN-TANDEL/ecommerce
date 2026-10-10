import express from "express";
import multer from "multer";
import { ClientUserController } from "../controller/ClientUserController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class ClientUserRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(ClientUserController);

        // ── Table Configurations ──
        router.get('/client_users/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/client_users/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/client_users/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/client_users/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/client_users/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/client_users', ctrl.getClientusers.bind(ctrl));
        router.post('/client_users', ctrl.getClientusers.bind(ctrl));
        router.get('/client_users/:id', ctrl.get.bind(ctrl));
        router.post('/client_users/create', ctrl.create.bind(ctrl));
        router.post('/client_users/create/all', ctrl.createAll.bind(ctrl));
        router.post('/client_users/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/client_users/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/client_users/update/:id', ctrl.update.bind(ctrl));
        router.post('/client_users/update/status', ctrl.updateStatus.bind(ctrl));
        router.post('/client_users/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/client_users/update/bulk/status', ctrl.updateBulkStatus.bind(ctrl));
        router.post('/client_users/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/client_users/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/client_users/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/client_users/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/client_users/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/client_users/lock', ctrl.getLocks.bind(ctrl));
        router.post('/client_users/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/client_users/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/client_users/export', ctrl.exportData.bind(ctrl));
        router.post('/client_users/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/client_users/view/list', ctrl.listViews.bind(ctrl));
        router.post('/client_users/view/create', ctrl.saveView.bind(ctrl));
        router.post('/client_users/view/save', ctrl.saveView.bind(ctrl));
        router.get('/client_users/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/client_users/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/client_users/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/client_users/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/client_users/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/client_users/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/client_users/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/client_users/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/client_users/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
