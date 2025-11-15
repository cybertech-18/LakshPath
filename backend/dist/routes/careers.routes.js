"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentService_1 = require("../services/assessmentService");
const router = (0, express_1.Router)();
router.get('/matches/:userId', async (req, res, next) => {
    try {
        const data = await assessmentService_1.assessmentService.getLatestForUser(req.params.userId);
        res.json({ career_matches: data.career_matches });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
