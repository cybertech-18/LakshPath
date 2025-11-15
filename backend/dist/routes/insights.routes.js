"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const insightService_1 = require("../services/insightService");
const router = (0, express_1.Router)();
router.get('/:userId', async (req, res, next) => {
    try {
        const insights = await insightService_1.insightService.listForUser(req.params.userId);
        res.json({ insights });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
