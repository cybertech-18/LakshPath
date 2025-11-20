"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geminiService_1 = require("./geminiService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.portfolioService = {
    /**
     * Analyze GitHub portfolio
     */
    async analyzeGitHubPortfolio(userId, githubUsername, targetRole) {
        try {
            // Fetch GitHub repositories
            const repos = await this.fetchGitHubRepos(githubUsername);
            // Prepare analysis request
            const analysisRequest = {
                githubUsername,
                repositories: repos.map((repo) => ({
                    name: repo.name,
                    description: repo.description || '',
                    language: repo.language || '',
                    stars: repo.stargazers_count || 0,
                    forks: repo.forks_count || 0,
                    hasReadme: true, // GitHub API doesn't easily tell, assume true
                    hasTests: false, // Would need to check repo contents
                    hasCi: false, // Would need to check .github/workflows
                    lastCommit: repo.pushed_at,
                })),
                targetRole,
            };
            // Get AI analysis
            const analysisResult = await geminiService_1.geminiService.analyzePortfolio(analysisRequest);
            const analysis = analysisResult.parsed;
            // Save to database
            const portfolioAnalysis = await prisma_1.default.portfolioAnalysis.create({
                data: {
                    userId,
                    githubUsername,
                    targetRole,
                    overallScore: analysis.overallScore,
                    codeQualityScore: analysis.codeQualityScore,
                    diversityScore: analysis.diversityScore,
                    contributionScore: analysis.contributionScore,
                    summary: analysis.summary,
                    strengths: JSON.stringify(analysis.strengths),
                    weaknesses: JSON.stringify(analysis.weaknesses),
                    missingProjectTypes: JSON.stringify(analysis.missingProjectTypes),
                    recommendations: JSON.stringify(analysis.recommendations),
                },
            });
            // Save repository insights
            if (analysis.repositoryInsights && analysis.repositoryInsights.length > 0) {
                await Promise.all(analysis.repositoryInsights.map((insight) => {
                    const repo = repos.find((r) => r.name === insight.repoName);
                    return prisma_1.default.repositoryAnalysis.create({
                        data: {
                            portfolioId: portfolioAnalysis.id,
                            repoName: insight.repoName,
                            repoUrl: repo?.html_url || `https://github.com/${githubUsername}/${insight.repoName}`,
                            description: repo?.description || '',
                            language: repo?.language || '',
                            stars: repo?.stargazers_count || 0,
                            forks: repo?.forks_count || 0,
                            lastCommit: repo?.pushed_at ? new Date(repo.pushed_at) : null,
                            codeQualityScore: insight.codeQualityScore,
                            complexity: insight.complexity,
                            hasReadme: true,
                            hasTests: false,
                            hasCi: false,
                            readmeQuality: insight.readmeQuality,
                            improvements: JSON.stringify(insight.improvements),
                            highlights: JSON.stringify(insight.highlights),
                        },
                    });
                }));
            }
            return await this.getAnalysis(portfolioAnalysis.id, userId);
        }
        catch (error) {
            throw new errorHandler_1.AppError(`Failed to analyze GitHub portfolio: ${error.message}`, 500, error);
        }
    },
    /**
     * Fetch GitHub repositories for a user
     */
    async fetchGitHubRepos(username) {
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'LakshPath-Career-Platform',
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new errorHandler_1.AppError('GitHub user not found', 404);
                }
                throw new errorHandler_1.AppError('Failed to fetch GitHub repositories', 502);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError('Failed to connect to GitHub API', 502, error);
        }
    },
    /**
     * Get portfolio analysis by ID
     */
    async getAnalysis(analysisId, userId) {
        const analysis = await prisma_1.default.portfolioAnalysis.findUnique({
            where: { id: analysisId },
            include: { repositories: true },
        });
        if (!analysis) {
            throw new errorHandler_1.AppError('Portfolio analysis not found', 404);
        }
        if (analysis.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        return {
            ...analysis,
            strengths: JSON.parse(analysis.strengths),
            weaknesses: JSON.parse(analysis.weaknesses),
            missingProjectTypes: analysis.missingProjectTypes
                ? JSON.parse(analysis.missingProjectTypes)
                : [],
            recommendations: JSON.parse(analysis.recommendations),
            repositories: analysis.repositories.map((repo) => ({
                ...repo,
                improvements: repo.improvements ? JSON.parse(repo.improvements) : [],
                highlights: repo.highlights ? JSON.parse(repo.highlights) : [],
            })),
        };
    },
    /**
     * Get all portfolio analyses for a user
     */
    async getUserAnalyses(userId, limit = 10) {
        const analyses = await prisma_1.default.portfolioAnalysis.findMany({
            where: { userId },
            include: {
                repositories: {
                    select: {
                        id: true,
                        repoName: true,
                        language: true,
                        stars: true,
                        codeQualityScore: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return analyses.map((analysis) => ({
            ...analysis,
            strengths: JSON.parse(analysis.strengths),
            weaknesses: JSON.parse(analysis.weaknesses),
            recommendations: JSON.parse(analysis.recommendations),
        }));
    },
    /**
     * Get portfolio statistics
     */
    async getUserStats(userId) {
        const analyses = await prisma_1.default.portfolioAnalysis.findMany({
            where: { userId },
            include: { repositories: true },
            orderBy: { createdAt: 'desc' },
        });
        if (analyses.length === 0) {
            return {
                totalAnalyses: 0,
                avgScore: 0,
                topLanguages: [],
                totalRepositories: 0,
                improvement: 0,
            };
        }
        const totalAnalyses = analyses.length;
        const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / totalAnalyses;
        const totalRepositories = analyses.reduce((sum, a) => sum + a.repositories.length, 0);
        // Calculate improvement (latest vs oldest)
        const improvement = analyses.length >= 2
            ? analyses[0].overallScore - analyses[analyses.length - 1].overallScore
            : 0;
        // Get top languages across all repositories
        const languageCounts = {};
        analyses.forEach((a) => {
            a.repositories.forEach((repo) => {
                if (repo.language) {
                    languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                }
            });
        });
        const topLanguages = Object.entries(languageCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([lang, count]) => ({ language: lang, count }));
        return {
            totalAnalyses,
            avgScore: Math.round(avgScore * 10) / 10,
            topLanguages,
            totalRepositories,
            improvement: Math.round(improvement * 10) / 10,
            recentAnalyses: analyses.slice(0, 3).map((a) => ({
                id: a.id,
                githubUsername: a.githubUsername,
                score: a.overallScore,
                createdAt: a.createdAt,
            })),
        };
    },
    /**
     * Delete portfolio analysis
     */
    async deleteAnalysis(analysisId, userId) {
        const analysis = await prisma_1.default.portfolioAnalysis.findUnique({
            where: { id: analysisId },
        });
        if (!analysis) {
            throw new errorHandler_1.AppError('Portfolio analysis not found', 404);
        }
        if (analysis.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        await prisma_1.default.portfolioAnalysis.delete({
            where: { id: analysisId },
        });
        return { message: 'Portfolio analysis deleted successfully' };
    },
};
