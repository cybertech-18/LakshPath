"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const geminiService_1 = require("./geminiService");
const json_1 = require("../utils/json");
const assessmentService_1 = require("./assessmentService");
const jobsFeed_1 = require("../lib/jobsFeed");
const DEFAULT_DOMAIN = 'Technology & Software';
const DOMAIN_SET = new Set([
    'Technology & Software',
    'Healthcare & Medicine',
    'Business & Finance',
    'Arts & Design',
    'Engineering',
    'Science & Research',
]);
const AUTO_SCOUT_LIMIT = 3;
const AUTO_SCOUT_TTL_MINUTES = 180;
const isDomainKey = (value) => (value ? DOMAIN_SET.has(value) : false);
const normalizeDomain = (domain) => {
    if (!domain)
        return DEFAULT_DOMAIN;
    return isDomainKey(domain) ? domain : DEFAULT_DOMAIN;
};
const deriveDomainFromSummary = (summary) => {
    const interests = summary?.domainInterests ?? {};
    const ranked = Object.entries(interests)
        .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
    const top = ranked[0]?.[0];
    if (isDomainKey(top))
        return top;
    const fallback = summary?.fieldInterest;
    if (isDomainKey(fallback))
        return fallback;
    return DEFAULT_DOMAIN;
};
const mapComparisonRow = (row) => ({
    id: row.id,
    jobTitle: row.jobTitle,
    company: row.company,
    matches: (0, json_1.safeParse)(row.matches, []),
    gaps: (0, json_1.safeParse)(row.gaps, []),
    suggestions: (0, json_1.safeParse)(row.suggestions, []),
    fastTrack: (0, json_1.safeParse)(row.fastTrack, []),
    summary: row.summary ?? '',
    source: row.source,
    jobMeta: (0, json_1.safeParse)(row.jobMeta, null),
    createdAt: row.createdAt,
});
const loadUserContext = async (userId) => {
    try {
        const latest = await assessmentService_1.assessmentService.getLatestForUser(userId);
        const summary = latest?.quizResult?.summary ?? {};
        const roadmapHighlights = latest?.learning_roadmap?.milestones
            ?.slice(0, 3)
            ?.map((milestone) => milestone.title);
        return {
            summary,
            roadmapHighlights,
            domain: deriveDomainFromSummary(summary),
        };
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError && error.statusCode === 404) {
            return {
                summary: {},
                roadmapHighlights: [],
                domain: DEFAULT_DOMAIN,
            };
        }
        throw error;
    }
};
const persistComparison = async (payload, aiResponse) => {
    const record = await prisma_1.default.jDComparison.create({
        data: {
            userId: payload.userId,
            jobTitle: payload.jobTitle,
            company: payload.company,
            jobDescription: payload.jobDescription,
            summary: aiResponse.parsed.summary,
            matches: (0, json_1.safeStringify)(aiResponse.parsed.matches),
            gaps: (0, json_1.safeStringify)(aiResponse.parsed.gaps),
            suggestions: (0, json_1.safeStringify)(aiResponse.parsed.suggestions),
            fastTrack: (0, json_1.safeStringify)(aiResponse.parsed.fastTrackMilestones),
            source: payload.source,
            jobMeta: payload.jobMeta ? (0, json_1.safeStringify)(payload.jobMeta) : undefined,
        },
    });
    await prisma_1.default.insight.create({
        data: {
            userId: payload.userId,
            source: 'GEMINI',
            prompt: aiResponse.prompt,
            response: aiResponse.raw,
            summary: payload.source === 'AUTO_SCOUT'
                ? `Auto-scout: ${payload.jobTitle}`
                : `JD comparison for ${payload.jobTitle}`,
            type: payload.source === 'AUTO_SCOUT' ? 'JD_AUTO_SCOUT' : 'JD_COMPARISON',
            metadata: (0, json_1.safeStringify)({
                source: payload.source,
                jobTitle: payload.jobTitle,
                company: payload.company,
                summary: aiResponse.parsed.summary,
            }),
        },
    });
    return record;
};
const autoScoutIsStale = (rows) => {
    if (!rows.length)
        return true;
    const latest = rows[0]?.createdAt ? new Date(rows[0].createdAt) : null;
    if (!latest)
        return true;
    const ageMinutes = (Date.now() - latest.getTime()) / 60000;
    return ageMinutes >= AUTO_SCOUT_TTL_MINUTES;
};
exports.jobsService = {
    listJobs(domain) {
        return (0, jobsFeed_1.listLiveJobs)(normalizeDomain(domain));
    },
    async compareDescription(payload) {
        if (!payload.userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const context = await loadUserContext(payload.userId);
        const aiResponse = await geminiService_1.geminiService.compareJobDescription({
            jobTitle: payload.jobTitle,
            company: payload.company,
            jobDescription: payload.jobDescription,
            profile: context.summary,
            roadmapHighlights: context.roadmapHighlights,
        });
        const record = await persistComparison({
            userId: payload.userId,
            jobTitle: payload.jobTitle,
            company: payload.company,
            jobDescription: payload.jobDescription,
            source: 'MANUAL',
        }, aiResponse);
        return {
            record,
            analysis: aiResponse.parsed,
        };
    },
    async listComparisons(userId) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const rows = await prisma_1.default.jDComparison.findMany({
            where: { userId, source: 'MANUAL' },
            orderBy: { createdAt: 'desc' },
            take: 12,
        });
        return rows.map(mapComparisonRow);
    },
    async getAutoScoutComparisons(userId, options) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        const limit = Math.min(Math.max(options?.limit ?? AUTO_SCOUT_LIMIT, 1), 5);
        const explicitDomain = normalizeDomain(options?.domain);
        const rows = await prisma_1.default.jDComparison.findMany({
            where: { userId, source: 'AUTO_SCOUT' },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        const normalizedRows = rows.map(mapComparisonRow);
        const shouldRefresh = options?.refresh || rows.length < limit || autoScoutIsStale(rows);
        if (!shouldRefresh) {
            const domainSnapshot = options?.domain
                ? explicitDomain
                : normalizeDomain(normalizedRows[0]?.jobMeta?.domain);
            return {
                domain: domainSnapshot,
                refreshed: false,
                matches: normalizedRows,
            };
        }
        const context = await loadUserContext(userId);
        const domainToUse = options?.domain ? explicitDomain : context.domain;
        const feed = (0, jobsFeed_1.pickAutoScoutJobs)(domainToUse, limit);
        const refreshed = [];
        for (const job of feed) {
            try {
                const aiResponse = await geminiService_1.geminiService.compareJobDescription({
                    jobTitle: job.title,
                    company: job.company,
                    jobDescription: job.description,
                    profile: context.summary,
                    roadmapHighlights: context.roadmapHighlights,
                });
                const record = await persistComparison({
                    userId,
                    jobTitle: job.title,
                    company: job.company,
                    jobDescription: job.description,
                    source: 'AUTO_SCOUT',
                    jobMeta: {
                        id: job.id,
                        domain: job.domain,
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        salary: job.salary,
                        type: job.type,
                        experience: job.experience,
                        tags: job.tags,
                        postedAgo: job.postedAgo,
                        jobUrl: job.jobUrl,
                        signals: job.signals,
                    },
                }, aiResponse);
                refreshed.push(record);
            }
            catch (error) {
                console.error('Auto-scout comparison failed', job.id, error);
            }
        }
        const latest = await prisma_1.default.jDComparison.findMany({
            where: { userId, source: 'AUTO_SCOUT' },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return {
            domain: domainToUse,
            refreshed: true,
            matches: latest.map(mapComparisonRow),
        };
    },
};
