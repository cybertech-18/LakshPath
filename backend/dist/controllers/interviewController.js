"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewController = void 0;
const interviewService_1 = require("../services/interviewService");
exports.interviewController = {
    /**
     * POST /api/interview/start
     * Start a new interview session
     */
    async startSession(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { type, difficulty, role } = req.body;
            if (!type || !difficulty) {
                return res.status(400).json({ error: 'Type and difficulty are required' });
            }
            const result = await interviewService_1.interviewService.startSession(userId, type, difficulty, role);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/interview/answer
     * Submit answer to a question
     */
    async submitAnswer(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { questionId, answer, timeTaken } = req.body;
            if (!questionId || !answer) {
                return res.status(400).json({ error: 'Question ID and answer are required' });
            }
            const result = await interviewService_1.interviewService.submitAnswer(questionId, userId, answer, timeTaken);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/interview/:sessionId/complete
     * Complete an interview session
     */
    async completeSession(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { sessionId } = req.params;
            const { speechTranscript } = req.body;
            const result = await interviewService_1.interviewService.completeSession(sessionId, userId, speechTranscript);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/interview/:sessionId
     * Get interview session details
     */
    async getSession(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { sessionId } = req.params;
            const result = await interviewService_1.interviewService.getSession(sessionId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/interview/sessions
     * Get all sessions for a user
     */
    async getUserSessions(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const result = await interviewService_1.interviewService.getUserSessions(userId, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/interview/stats
     * Get interview statistics
     */
    async getUserStats(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await interviewService_1.interviewService.getUserStats(userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/interview/:sessionId/next
     * Get next question in session
     */
    async getNextQuestion(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { sessionId } = req.params;
            const result = await interviewService_1.interviewService.getNextQuestion(sessionId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
