"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const json_1 = require("../utils/json");
const profileSelect = {
    id: true,
    name: true,
    email: true,
    avatarUrl: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};
const mapQuizSummary = (summary) => {
    if (!summary)
        return null;
    return (0, json_1.safeParse)(summary, {});
};
exports.userService = {
    async getProfile(userId) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const user = await prisma_1.default.user.findUnique({ where: { id: userId }, select: profileSelect });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const [latestQuiz, roadmap] = await Promise.all([
            prisma_1.default.quizResult.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    createdAt: true,
                    summary: true,
                    strengths: true,
                    weaknesses: true,
                },
            }),
            prisma_1.default.learningRoadmap.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    summary: true,
                    duration: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            profile: user,
            latestAssessment: latestQuiz
                ? {
                    id: latestQuiz.id,
                    createdAt: latestQuiz.createdAt,
                    summary: mapQuizSummary(latestQuiz.summary),
                    strengths: mapQuizSummary(latestQuiz.strengths),
                    weaknesses: mapQuizSummary(latestQuiz.weaknesses),
                }
                : null,
            activeRoadmap: roadmap,
        };
    },
    async updateProfile(userId, payload) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const updates = {};
        if (typeof payload.name === 'string') {
            updates.name = payload.name.trim();
        }
        if (typeof payload.avatarUrl === 'string') {
            updates.avatarUrl = payload.avatarUrl.trim();
        }
        if (!Object.keys(updates).length) {
            throw new errorHandler_1.AppError('No valid fields provided', 400);
        }
        const user = await prisma_1.default.user.update({ where: { id: userId }, data: updates, select: profileSelect });
        return { profile: user };
    },
    async getProgress(userId) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const [assessmentsCompleted, insightsGenerated, jobsCompared, milestones] = await Promise.all([
            prisma_1.default.quizResult.count({ where: { userId } }),
            prisma_1.default.insight.count({ where: { userId } }),
            prisma_1.default.jDComparison.count({ where: { userId } }),
            prisma_1.default.roadmapMilestone.findMany({
                where: { roadmap: { userId } },
                select: { status: true },
            }),
        ]);
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter((milestone) => milestone.status === 'COMPLETED').length;
        const inProgressMilestones = milestones.filter((milestone) => milestone.status === 'IN_PROGRESS').length;
        return {
            stats: {
                assessmentsCompleted,
                insightsGenerated,
                jobsCompared,
                milestones: {
                    total: totalMilestones,
                    completed: completedMilestones,
                    inProgress: inProgressMilestones,
                    pending: totalMilestones - completedMilestones - inProgressMilestones,
                },
            },
        };
    },
};
