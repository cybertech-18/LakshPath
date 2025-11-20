"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioController = void 0;
const portfolioService_1 = require("../services/portfolioService");
exports.portfolioController = {
    /**
     * POST /api/portfolio/analyze
     * Analyze GitHub portfolio
     */
    async analyzeGitHub(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { githubUsername, targetRole } = req.body;
            if (!githubUsername) {
                return res.status(400).json({ error: 'GitHub username is required' });
            }
            const result = await portfolioService_1.portfolioService.analyzeGitHubPortfolio(userId, githubUsername, targetRole);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/portfolio/:analysisId
     * Get portfolio analysis by ID
     */
    async getAnalysis(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { analysisId } = req.params;
            const result = await portfolioService_1.portfolioService.getAnalysis(analysisId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/portfolio/analyses
     * Get all analyses for user
     */
    async getUserAnalyses(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const result = await portfolioService_1.portfolioService.getUserAnalyses(userId, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/portfolio/stats
     * Get portfolio statistics
     */
    async getUserStats(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await portfolioService_1.portfolioService.getUserStats(userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/portfolio/:analysisId
     * Delete portfolio analysis
     */
    async deleteAnalysis(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { analysisId } = req.params;
            const result = await portfolioService_1.portfolioService.deleteAnalysis(analysisId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
