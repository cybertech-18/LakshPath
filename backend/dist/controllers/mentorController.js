"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentorController = void 0;
const mentorService_1 = require("../services/mentorService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.mentorController = {
    async analyzeProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Unauthorized', 401);
            }
            const analysis = await mentorService_1.mentorService.analyzeUser(userId);
            res.json({ success: true, analysis });
        }
        catch (error) {
            next(error);
        }
    },
    async startSession(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Unauthorized', 401);
            }
            const { sessionType, message } = req.body;
            if (!sessionType || !message) {
                throw new errorHandler_1.AppError('sessionType and message are required', 400);
            }
            const validTypes = ['onboarding', 'progress_check', 'career_guidance', 'skill_building', 'interview_prep'];
            if (!validTypes.includes(sessionType)) {
                throw new errorHandler_1.AppError(`Invalid sessionType. Must be one of: ${validTypes.join(', ')}`, 400);
            }
            const session = await mentorService_1.mentorService.startMentorSession(userId, sessionType, message);
            res.json({ success: true, session });
        }
        catch (error) {
            next(error);
        }
    },
    async chat(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Unauthorized', 401);
            }
            const { message, context } = req.body;
            if (!message) {
                throw new errorHandler_1.AppError('message is required', 400);
            }
            const response = await mentorService_1.mentorService.continueMentorChat(userId, message, context);
            res.json({ success: true, ...response });
        }
        catch (error) {
            next(error);
        }
    },
    async getHistory(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Unauthorized', 401);
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const history = await mentorService_1.mentorService.getMentorHistory(userId, limit);
            res.json({ success: true, history });
        }
        catch (error) {
            next(error);
        }
    },
};
