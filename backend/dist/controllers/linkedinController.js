"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkedinController = void 0;
const linkedinService_1 = require("../services/linkedinService");
exports.linkedinController = {
    /**
     * POST /api/linkedin/optimize
     * Optimize LinkedIn profile
     */
    async optimizeProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const profileData = req.body;
            const result = await linkedinService_1.linkedinService.optimizeProfile(userId, profileData);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/linkedin/:optimizationId
     * Get optimization by ID
     */
    async getOptimization(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { optimizationId } = req.params;
            const result = await linkedinService_1.linkedinService.getOptimization(optimizationId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/linkedin/optimizations
     * Get all optimizations for user
     */
    async getUserOptimizations(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const result = await linkedinService_1.linkedinService.getUserOptimizations(userId, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/linkedin/:optimizationId/status
     * Update optimization status
     */
    async updateStatus(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { optimizationId } = req.params;
            const { status } = req.body;
            if (!status || !['DRAFT', 'APPLIED', 'ARCHIVED'].includes(status)) {
                return res.status(400).json({ error: 'Valid status is required' });
            }
            const result = await linkedinService_1.linkedinService.updateStatus(optimizationId, userId, status);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/linkedin/stats
     * Get LinkedIn optimization statistics
     */
    async getUserStats(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await linkedinService_1.linkedinService.getUserStats(userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/linkedin/:optimizationId
     * Delete optimization
     */
    async deleteOptimization(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { optimizationId } = req.params;
            const result = await linkedinService_1.linkedinService.deleteOptimization(optimizationId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/linkedin/compare
     * Compare multiple optimization versions
     */
    async compareVersions(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { optimizationIds } = req.body;
            if (!optimizationIds || !Array.isArray(optimizationIds)) {
                return res
                    .status(400)
                    .json({ error: 'optimizationIds array is required' });
            }
            const result = await linkedinService_1.linkedinService.compareVersions(userId, optimizationIds);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
