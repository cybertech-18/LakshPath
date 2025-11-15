"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmapService_1 = require("../services/roadmapService");
const router = (0, express_1.Router)();
router.get('/:userId', async (req, res, next) => {
    try {
        const roadmap = await roadmapService_1.roadmapService.getActiveRoadmap(req.params.userId);
        res.json({ learning_roadmap: roadmap });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/milestone/:milestoneId', async (req, res, next) => {
    try {
        const result = await roadmapService_1.roadmapService.updateMilestoneStatus(req.params.milestoneId, req.body.status ?? 'IN_PROGRESS');
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
