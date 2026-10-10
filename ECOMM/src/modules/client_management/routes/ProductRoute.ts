import express from "express";
import multer from "multer";
import { ProductController } from "../controller/ProductController.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class ProductRoute {

    route = () => {
        const router = express.Router();
        const ctrl = app(ProductController);

        // ── Table Configurations ──
        router.get('/products/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/products/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/products/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/products/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/products/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/products', ctrl.getProducts.bind(ctrl));
        router.post('/products', ctrl.getProducts.bind(ctrl));
        router.get('/products/:id', ctrl.get.bind(ctrl));
        router.post('/products/create', ctrl.create.bind(ctrl));
        router.post('/products/create/all', ctrl.createAll.bind(ctrl));
        router.post('/products/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/products/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/products/update/:id', ctrl.update.bind(ctrl));
        router.post('/products/update/status', ctrl.updateStatus.bind(ctrl));
        router.post('/products/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/products/update/bulk/status', ctrl.updateBulkStatus.bind(ctrl));
        router.post('/products/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/products/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/products/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/products/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/products/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/products/lock', ctrl.getLocks.bind(ctrl));
        router.post('/products/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/products/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/products/export', ctrl.exportData.bind(ctrl));
        router.post('/products/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/products/view/list', ctrl.listViews.bind(ctrl));
        router.post('/products/view/create', ctrl.saveView.bind(ctrl));
        router.post('/products/view/save', ctrl.saveView.bind(ctrl));
        router.get('/products/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/products/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/products/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/products/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/products/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/products/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/products/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/products/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/products/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
