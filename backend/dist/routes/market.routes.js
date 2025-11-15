"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketService_1 = require("../services/marketService");
const router = (0, express_1.Router)();
router.get('/brief', async (req, res, next) => {
    try {
        const brief = await marketService_1.marketService.getBrief(req.query.domain);
        res.json({ brief });
    }
    catch (error) {
        next(error);
    }
});
router.get('/history', async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const history = await marketService_1.marketService.getHistory(req.query.domain, limit);
        res.json({ history });
    }
    catch (error) {
        next(error);
    }
});
router.post('/brief/refresh', async (req, res, next) => {
    try {
        const brief = await marketService_1.marketService.refreshBrief(req.body?.domain || req.query.domain);
        res.json({ brief, refreshed: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
