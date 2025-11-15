"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobsService_1 = require("../services/jobsService");
const router = (0, express_1.Router)();
router.get('/list', (req, res) => {
    res.json({ jobs: jobsService_1.jobsService.listJobs(req.query.domain) });
});
router.get('/comparisons/:userId', async (req, res, next) => {
    try {
        const rows = await jobsService_1.jobsService.listComparisons(req.params.userId);
        res.json({ comparisons: rows });
    }
    catch (error) {
        next(error);
    }
});
router.post('/compare', async (req, res, next) => {
    try {
        const analysis = await jobsService_1.jobsService.compareDescription({
            userId: req.body.userId,
            jobTitle: req.body.jobTitle,
            company: req.body.company,
            jobDescription: req.body.jobDescription,
        });
        res.json(analysis);
    }
    catch (error) {
        next(error);
    }
});
router.get('/auto-scout/:userId', async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const refresh = typeof req.query.refresh === 'string'
            ? ['true', '1', 'yes'].includes(req.query.refresh.toLowerCase())
            : undefined;
        const autoScout = await jobsService_1.jobsService.getAutoScoutComparisons(req.params.userId, {
            limit,
            domain: req.query.domain,
            refresh,
        });
        res.json({ autoScout });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
