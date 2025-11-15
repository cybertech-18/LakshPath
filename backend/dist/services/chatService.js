"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geminiService_1 = require("./geminiService");
const errorHandler_1 = require("../middleware/errorHandler");
const json_1 = require("../utils/json");
const domainThemes_1 = require("../lib/domainThemes");
const DEFAULT_DOMAIN = 'Technology & Software';
const isForeignKeyConstraintError = (error) => {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2003');
};
const buildMentorContext = async (userId, baseContext = {}) => {
    const [quizResult, recentInsights] = await Promise.all([
        prisma_1.default.quizResult.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.default.insight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        }),
    ]);
    const summary = (0, json_1.safeParse)(quizResult?.summary, {});
    const domainFocus = summary?.fieldInterest || DEFAULT_DOMAIN;
    const domainTheme = domainThemes_1.DOMAIN_THEMES[domainFocus] || domainThemes_1.DOMAIN_THEMES.default;
    const domainInterests = summary?.domainInterests ?? undefined;
    const insightHighlights = recentInsights.map((insight) => {
        const metadata = (0, json_1.safeParse)(insight.metadata, {});
        const shortMeta = metadata?.headline || metadata?.summary;
        return `${insight.type}: ${shortMeta ?? insight.summary}`;
    });
    return {
        ...baseContext,
        assessmentSummary: summary,
        domainFocus,
        domainTheme: {
            mission: domainTheme.mission,
            personalityTag: domainTheme.personalityTag,
            aiHook: domainTheme.aiHook,
            tone: domainTheme.tone,
        },
        domainInterests,
        recentInsights: insightHighlights,
    };
};
exports.chatService = {
    async mentorRound(payload) {
        if (!payload.userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        if (!payload.message)
            throw new errorHandler_1.AppError('message is required', 400);
        const context = payload.context ?? {};
        const enrichedContext = await buildMentorContext(payload.userId, context);
        const request = {
            round: payload.round,
            message: payload.message,
            context: enrichedContext,
        };
        const aiResponse = await geminiService_1.geminiService.mentorChat(request);
        const replySummary = aiResponse.parsed.headline ?? `AI mentor (${payload.round}) reply`;
        try {
            await prisma_1.default.insight.create({
                data: {
                    userId: payload.userId,
                    source: 'GEMINI',
                    prompt: aiResponse.prompt,
                    response: aiResponse.raw,
                    summary: replySummary,
                    type: 'CHAT',
                    metadata: (0, json_1.safeStringify)({ message: payload.message, reply: aiResponse.parsed }),
                },
            });
        }
        catch (error) {
            if (isForeignKeyConstraintError(error)) {
                console.warn(`[chatService] Skipping insight persistence for missing user ${payload.userId}`);
            }
            else {
                throw error;
            }
        }
        return aiResponse.parsed;
    },
};
