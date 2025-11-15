"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const demoService_1 = require("../services/demoService");
const router = (0, express_1.Router)();
router.post('/run', async (_req, res, next) => {
    try {
        const payload = await demoService_1.demoService.runDemo();
        res.json(payload);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
