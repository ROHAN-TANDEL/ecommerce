import express from "express";
import multer from "multer";
import { PartnerController } from "../controller/PartnerController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class PartnerRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(PartnerController);

        // ── Table Configurations ──
        router.get('/partners/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/partners/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/partners/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/partners/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/partners/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/partners', ctrl.getPartners.bind(ctrl));
        router.post('/partners', ctrl.getPartners.bind(ctrl));
        router.get('/partners/:id', ctrl.get.bind(ctrl));
        router.post('/partners/create', ctrl.create.bind(ctrl));
        router.post('/partners/create/all', ctrl.createAll.bind(ctrl));
        router.post('/partners/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/partners/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/partners/update/:id', ctrl.update.bind(ctrl));
        router.post('/partners/update/status', ctrl.updateStatus.bind(ctrl));
        router.post('/partners/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/partners/update/bulk/status', ctrl.updateBulkStatus.bind(ctrl));
        router.post('/partners/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/partners/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/partners/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/partners/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/partners/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/partners/lock', ctrl.getLocks.bind(ctrl));
        router.post('/partners/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/partners/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/partners/export', ctrl.exportData.bind(ctrl));
        router.post('/partners/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/partners/view/list', ctrl.listViews.bind(ctrl));
        router.post('/partners/view/create', ctrl.saveView.bind(ctrl));
        router.post('/partners/view/save', ctrl.saveView.bind(ctrl));
        router.get('/partners/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/partners/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/partners/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/partners/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/partners/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/partners/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/partners/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/partners/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/partners/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
