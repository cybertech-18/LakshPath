"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadmapService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const json_1 = require("../utils/json");
const geminiService_1 = require("./geminiService");
const domainThemes_1 = require("../lib/domainThemes");
const notificationService_1 = require("./notificationService");
const DEFAULT_DOMAIN = 'Technology & Software';
const parseDurationWeeks = (duration) => {
    if (!duration)
        return 4;
    const value = Number(duration.match(/\d+/)?.[0] ?? 4);
    if (duration.toLowerCase().includes('month')) {
        return value * 4;
    }
    return value;
};
const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};
const formatGoalContract = (contract) => ({
    id: contract.id,
    milestoneId: contract.milestoneId,
    title: contract.title,
    description: contract.description,
    successCriteria: contract.successCriteria,
    startDate: contract.startDate,
    endDate: contract.endDate,
    status: contract.status,
    nudges: (0, json_1.safeParse)(contract.nudges, []),
});
const resolveDomainTheme = (summary) => {
    const domainFocus = summary?.fieldInterest || DEFAULT_DOMAIN;
    const theme = domainThemes_1.DOMAIN_THEMES[domainFocus] || domainThemes_1.DOMAIN_THEMES.default;
    return { domainFocus, theme };
};
const ensureGoalForNextMilestone = async (completedMilestone, summary, strengths = [], weaknesses = []) => {
    const nextMilestone = await prisma_1.default.roadmapMilestone.findFirst({
        where: {
            roadmapId: completedMilestone.roadmapId,
            position: { gt: completedMilestone.position },
        },
        orderBy: { position: 'asc' },
    });
    if (!nextMilestone)
        return null;
    const existing = await prisma_1.default.goalContract.findUnique({ where: { milestoneId: nextMilestone.id } });
    if (existing) {
        return existing;
    }
    const { domainFocus, theme } = resolveDomainTheme(summary);
    let aiGoal = null;
    const profile = {
        name: completedMilestone.roadmap.user.name ?? undefined,
        education: summary?.educationLevel ?? undefined,
        strengths,
        weaknesses,
        preferredWorkStyle: summary?.workStyle ?? undefined,
        motivation: summary?.motivation ?? undefined,
        targetSalary: summary?.salaryExpectation ?? undefined,
    };
    try {
        aiGoal = await geminiService_1.geminiService.goalSuccessCriteria({
            milestoneTitle: nextMilestone.title,
            durationWeeks: parseDurationWeeks(nextMilestone.duration),
            profile,
        });
    }
    catch (error) {
        console.error('Goal automation failed, falling back to defaults', error);
    }
    const nudgePool = new Set();
    (aiGoal?.parsed.weeklyNudges ?? []).forEach((nudge) => nudge && nudgePool.add(nudge));
    if (theme.aiHook)
        nudgePool.add(theme.aiHook);
    theme.nudges.forEach((nudge) => nudge && nudgePool.add(nudge));
    const nudgeList = Array.from(nudgePool).slice(0, 5);
    const successCriteria = aiGoal?.parsed.successCriteria ?? `Complete ${nextMilestone.title} with measurable outputs.`;
    const goalContract = await prisma_1.default.goalContract.create({
        data: {
            userId: completedMilestone.roadmap.userId,
            milestoneId: nextMilestone.id,
            title: nextMilestone.title,
            description: nextMilestone.description,
            startDate: new Date(),
            endDate: addDays(new Date(), parseDurationWeeks(nextMilestone.duration) * 7),
            successCriteria,
            nudges: (0, json_1.safeStringify)(nudgeList),
            status: 'ACTIVE',
        },
    });
    if (aiGoal) {
        await prisma_1.default.insight.create({
            data: {
                userId: completedMilestone.roadmap.userId,
                source: 'GEMINI',
                prompt: aiGoal.prompt,
                response: aiGoal.raw,
                summary: `SMART goal created for ${nextMilestone.title}`,
                type: 'GOAL_CONTRACT',
                metadata: (0, json_1.safeStringify)({
                    nudges: nudgeList,
                    domainFocus,
                    mission: theme.mission,
                }),
            },
        });
    }
    await notificationService_1.notificationService.sendGoalContractNotification({
        user: {
            id: completedMilestone.roadmap.user.id,
            name: completedMilestone.roadmap.user.name,
            email: completedMilestone.roadmap.user.email,
        },
        goal: {
            title: goalContract.title,
            successCriteria: goalContract.successCriteria,
            nudges: nudgeList,
            startDate: goalContract.startDate,
            endDate: goalContract.endDate,
        },
        tone: theme.tone,
    });
    return goalContract;
};
exports.roadmapService = {
    async getActiveRoadmap(userId) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const roadmap = await prisma_1.default.learningRoadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { milestones: true },
        });
        if (!roadmap) {
            throw new errorHandler_1.AppError('No roadmap found', 404);
        }
        return {
            id: roadmap.id,
            title: roadmap.title,
            duration: roadmap.duration,
            summary: roadmap.summary,
            ai_plan: (0, json_1.safeParse)(roadmap.aiPlan, null),
            milestones: roadmap.milestones
                .sort((a, b) => a.position - b.position)
                .map((milestone) => ({
                id: milestone.id,
                title: milestone.title,
                description: milestone.description,
                duration: milestone.duration,
                status: milestone.status,
                resources: (0, json_1.safeParse)(milestone.resources, []),
                position: milestone.position,
            })),
        };
    },
    async updateMilestoneStatus(milestoneId, status) {
        if (!milestoneId)
            throw new errorHandler_1.AppError('milestoneId is required', 400);
        const milestone = await prisma_1.default.roadmapMilestone.update({
            where: { id: milestoneId },
            data: { status },
            include: {
                roadmap: {
                    include: {
                        user: true,
                        quizResult: true,
                    },
                },
            },
        });
        const summary = (0, json_1.safeParse)(milestone.roadmap.quizResult?.summary, {});
        const strengths = (0, json_1.safeParse)(milestone.roadmap.quizResult?.strengths, []);
        const weaknesses = (0, json_1.safeParse)(milestone.roadmap.quizResult?.weaknesses, []);
        let nextGoalContract = null;
        if (status === 'COMPLETED') {
            nextGoalContract = await ensureGoalForNextMilestone(milestone, summary, strengths, weaknesses);
        }
        return {
            milestone: {
                id: milestone.id,
                title: milestone.title,
                description: milestone.description,
                duration: milestone.duration,
                status: milestone.status,
                position: milestone.position,
                updatedAt: milestone.updatedAt,
            },
            goalContract: nextGoalContract ? formatGoalContract(nextGoalContract) : null,
        };
    },
};
