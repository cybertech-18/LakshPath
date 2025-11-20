"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkedinService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geminiService_1 = require("./geminiService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.linkedinService = {
    /**
     * Optimize LinkedIn profile
     */
    async optimizeProfile(userId, profileData) {
        try {
            // Prepare optimization request
            const optimizationRequest = {
                ...profileData,
            };
            // Get AI optimization
            const optimizationResult = await geminiService_1.geminiService.optimizeLinkedInProfile(optimizationRequest);
            const optimization = optimizationResult.parsed;
            // Save to database
            const linkedinOptimization = await prisma_1.default.linkedInOptimization.create({
                data: {
                    userId,
                    targetRole: profileData.targetRole,
                    targetIndustry: profileData.targetIndustry,
                    currentHeadline: profileData.currentHeadline,
                    optimizedHeadline: optimization.optimizedHeadline,
                    currentAbout: profileData.currentAbout,
                    optimizedAbout: optimization.optimizedAbout,
                    currentExperience: profileData.currentExperience
                        ? JSON.stringify(profileData.currentExperience)
                        : null,
                    optimizedExperience: optimization.optimizedExperience
                        ? JSON.stringify(optimization.optimizedExperience)
                        : null,
                    keywords: JSON.stringify(optimization.keywords),
                    overallScore: optimization.overallScore,
                    beforeScore: optimization.beforeScore,
                    afterScore: optimization.afterScore,
                    improvements: JSON.stringify(optimization.improvements),
                    missingElements: optimization.missingElements
                        ? JSON.stringify(optimization.missingElements)
                        : null,
                    status: 'DRAFT',
                },
            });
            return await this.getOptimization(linkedinOptimization.id, userId);
        }
        catch (error) {
            throw new errorHandler_1.AppError(`Failed to optimize LinkedIn profile: ${error.message}`, 500, error);
        }
    },
    /**
     * Get optimization by ID
     */
    async getOptimization(optimizationId, userId) {
        const optimization = await prisma_1.default.linkedInOptimization.findUnique({
            where: { id: optimizationId },
        });
        if (!optimization) {
            throw new errorHandler_1.AppError('LinkedIn optimization not found', 404);
        }
        if (optimization.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        return {
            ...optimization,
            currentExperience: optimization.currentExperience
                ? JSON.parse(optimization.currentExperience)
                : null,
            optimizedExperience: optimization.optimizedExperience
                ? JSON.parse(optimization.optimizedExperience)
                : null,
            keywords: JSON.parse(optimization.keywords),
            improvements: JSON.parse(optimization.improvements),
            missingElements: optimization.missingElements
                ? JSON.parse(optimization.missingElements)
                : null,
        };
    },
    /**
     * Get all optimizations for a user
     */
    async getUserOptimizations(userId, limit = 10) {
        const optimizations = await prisma_1.default.linkedInOptimization.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return optimizations.map((opt) => ({
            ...opt,
            keywords: JSON.parse(opt.keywords),
            improvements: JSON.parse(opt.improvements),
            missingElements: opt.missingElements ? JSON.parse(opt.missingElements) : null,
        }));
    },
    /**
     * Update optimization status
     */
    async updateStatus(optimizationId, userId, status) {
        const optimization = await prisma_1.default.linkedInOptimization.findUnique({
            where: { id: optimizationId },
        });
        if (!optimization) {
            throw new errorHandler_1.AppError('LinkedIn optimization not found', 404);
        }
        if (optimization.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        const updated = await prisma_1.default.linkedInOptimization.update({
            where: { id: optimizationId },
            data: { status },
        });
        return updated;
    },
    /**
     * Get user statistics
     */
    async getUserStats(userId) {
        const optimizations = await prisma_1.default.linkedInOptimization.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        if (optimizations.length === 0) {
            return {
                totalOptimizations: 0,
                avgImprovement: 0,
                appliedCount: 0,
                draftCount: 0,
            };
        }
        const totalOptimizations = optimizations.length;
        const avgImprovement = optimizations.reduce((sum, o) => sum + (o.afterScore - (o.beforeScore || 0)), 0) /
            totalOptimizations;
        const appliedCount = optimizations.filter((o) => o.status === 'APPLIED').length;
        const draftCount = optimizations.filter((o) => o.status === 'DRAFT').length;
        return {
            totalOptimizations,
            avgImprovement: Math.round(avgImprovement * 10) / 10,
            appliedCount,
            draftCount,
            recentOptimizations: optimizations.slice(0, 3).map((o) => ({
                id: o.id,
                targetRole: o.targetRole,
                status: o.status,
                improvement: o.afterScore - (o.beforeScore || 0),
                createdAt: o.createdAt,
            })),
        };
    },
    /**
     * Delete optimization
     */
    async deleteOptimization(optimizationId, userId) {
        const optimization = await prisma_1.default.linkedInOptimization.findUnique({
            where: { id: optimizationId },
        });
        if (!optimization) {
            throw new errorHandler_1.AppError('LinkedIn optimization not found', 404);
        }
        if (optimization.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        await prisma_1.default.linkedInOptimization.delete({
            where: { id: optimizationId },
        });
        return { message: 'LinkedIn optimization deleted successfully' };
    },
    /**
     * Compare multiple versions
     */
    async compareVersions(userId, optimizationIds) {
        const optimizations = await Promise.all(optimizationIds.map((id) => this.getOptimization(id, userId)));
        return {
            comparison: optimizations.map((opt) => ({
                id: opt.id,
                targetRole: opt.targetRole,
                headline: opt.optimizedHeadline,
                score: opt.afterScore,
                improvement: opt.afterScore - (opt.beforeScore || 0),
                createdAt: opt.createdAt,
            })),
            bestScore: Math.max(...optimizations.map((o) => o.afterScore)),
            avgImprovement: optimizations.reduce((sum, o) => sum + (o.afterScore - (o.beforeScore || 0)), 0) /
                optimizations.length,
        };
    },
};
