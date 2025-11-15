"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const json_1 = require("../utils/json");
exports.insightService = {
    async listForUser(userId) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const insights = await prisma_1.default.insight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return insights.map((insight) => ({
            id: insight.id,
            summary: insight.summary,
            type: insight.type,
            createdAt: insight.createdAt,
            prompt: insight.prompt,
            metadata: (0, json_1.safeParse)(insight.metadata, {}),
        }));
    },
};
