"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentService = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const careerEngine_1 = require("../lib/careerEngine");
const geminiService_1 = require("./geminiService");
const errorHandler_1 = require("../middleware/errorHandler");
const json_1 = require("../utils/json");
const submitSchema = zod_1.z.object({
    user: zod_1.z
        .object({
        id: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        name: zod_1.z.string().optional(),
    })
        .optional(),
    answers: zod_1.z.record(zod_1.z.any()),
    profile: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        education: zod_1.z.string().optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
    demo: zod_1.z.boolean().optional(),
});
const stringify = json_1.safeStringify;
const buildProfileSummary = (parsed, overrides) => {
    const strengths = [];
    const weaknesses = [];
    if (parsed.technicalSkill >= 4)
        strengths.push('Technical problem solving');
    else
        weaknesses.push('Deep technical foundations');
    if (parsed.communicationSkill >= 4)
        strengths.push('Communication & storytelling');
    else
        weaknesses.push('Narrative confidence');
    if (parsed.analyticalSkill >= 4)
        strengths.push('Analytical reasoning');
    else
        weaknesses.push('Structured analysis');
    if (parsed.creativitySkill >= 4)
        strengths.push('Creative experimentation');
    else
        weaknesses.push('Divergent thinking');
    const domainRanking = Object.entries(parsed.domainInterestScores ?? {})
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
    return {
        name: overrides?.name,
        education: overrides?.education ?? parsed.educationLevel,
        interests: overrides?.interests ?? [parsed.fieldInterest],
        strengths,
        weaknesses,
        preferredWorkStyle: parsed.workStyle,
        motivation: parsed.motivation,
        targetSalary: parsed.salaryExpectation,
        domainFocus: domainRanking[0]?.[0],
        domainInterests: parsed.domainInterestScores,
        skillRatings: {
            technical: parsed.technicalSkill,
            communication: parsed.communicationSkill,
            analytical: parsed.analyticalSkill,
            creativity: parsed.creativitySkill,
        },
    };
};
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
const ensureUser = async (payload, demo) => {
    if (payload?.id) {
        const existing = await prisma_1.default.user.findUnique({ where: { id: payload.id } });
        if (existing)
            return existing;
    }
    if (payload?.email) {
        const byEmail = await prisma_1.default.user.findUnique({ where: { email: payload.email } });
        if (byEmail)
            return byEmail;
    }
    const name = payload?.name ?? (demo ? 'Demo Learner' : 'Student');
    return prisma_1.default.user.create({
        data: {
            name,
            email: payload?.email,
            role: demo ? 'DEMO' : 'USER',
        },
    });
};
exports.assessmentService = {
    async submitAssessment(input) {
        const payload = submitSchema.parse(input);
        const user = await ensureUser(payload.user, payload.demo);
        const { parsed, topCareers } = (0, careerEngine_1.generateCareerMatches)(payload.answers);
        if (!topCareers.length) {
            throw new errorHandler_1.AppError('Unable to compute career matches', 400);
        }
        const avgSkillScore = (parsed.technicalSkill +
            parsed.communicationSkill +
            parsed.analyticalSkill +
            parsed.creativitySkill) / 4;
        const summary = {
            educationLevel: parsed.educationLevel,
            fieldInterest: parsed.fieldInterest,
            motivation: parsed.motivation,
            workEnvironment: parsed.workEnvironment,
            workStyle: parsed.workStyle,
            salaryExpectation: parsed.salaryExpectation,
            avgSkillScore: avgSkillScore.toFixed(1),
            skillRatings: {
                technical: parsed.technicalSkill,
                communication: parsed.communicationSkill,
                analytical: parsed.analyticalSkill,
                creativity: parsed.creativitySkill,
            },
            domainInterests: parsed.domainInterestScores,
        };
        const profileSummary = buildProfileSummary(parsed, payload.profile);
        let explanationAi = null;
        let aiRoadmap = null;
        let goalAi = null;
        try {
            explanationAi = await geminiService_1.geminiService.explainCareers({
                profile: profileSummary,
                quizInsights: summary,
                topCareers: topCareers.map((career) => ({
                    title: career.title,
                    matchScore: career.matchScore,
                    description: career.description,
                    keySkills: career.keySkills,
                })),
            });
        }
        catch (error) {
            console.error('Gemini career explanation failed', error);
        }
        try {
            aiRoadmap = await geminiService_1.geminiService.generateRoadmap({
                careerTitle: topCareers[0].title,
                seniority: avgSkillScore >= 4 ? 'intermediate' : 'beginner',
                durationMonths: 6,
                profile: profileSummary,
            });
        }
        catch (error) {
            console.error('Gemini roadmap failed', error);
        }
        const roadmapDraft = aiRoadmap
            ? aiRoadmap.parsed.months.map((month) => ({
                title: `Month ${month.month}: ${month.theme}`,
                description: `Focus on ${month.skills.join(', ')}`,
                duration: '4 weeks',
                status: month.month === 1 ? 'IN_PROGRESS' : 'PENDING',
                resources: month.resources.map((resource) => ({ title: resource, platform: 'Curated', link: '#' })),
            }))
            : (0, careerEngine_1.buildRoadmapFromCareer)(topCareers[0]).milestones;
        const primaryMilestone = roadmapDraft[0];
        if (primaryMilestone) {
            try {
                goalAi = await geminiService_1.geminiService.goalSuccessCriteria({
                    milestoneTitle: primaryMilestone.title,
                    durationWeeks: parseDurationWeeks(primaryMilestone.duration),
                    profile: profileSummary,
                });
            }
            catch (error) {
                console.error('Gemini goal criteria failed', error);
            }
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            const quizResult = await tx.quizResult.create({
                data: {
                    userId: user.id,
                    answers: stringify(payload.answers),
                    summary: stringify(summary),
                    strengths: stringify(profileSummary.strengths),
                    weaknesses: stringify(profileSummary.weaknesses),
                    advice: stringify({ motivation: parsed.motivation }),
                },
                select: { id: true },
            });
            const careerMatches = await Promise.all(topCareers.map((career) => tx.careerMatch.create({
                data: {
                    quizResultId: quizResult.id,
                    title: career.title,
                    matchScore: career.matchScore,
                    description: career.description,
                    avgSalary: career.avgSalary,
                    growthRate: career.growthRate,
                    keySkills: stringify(career.keySkills),
                },
                select: {
                    id: true,
                    title: true,
                    matchScore: true,
                    description: true,
                    avgSalary: true,
                    growthRate: true,
                    keySkills: true,
                },
            })));
            const roadmap = await tx.learningRoadmap.create({
                data: {
                    quizResultId: quizResult.id,
                    userId: user.id,
                    title: `${topCareers[0].title} Launch Plan`,
                    duration: '6 months',
                    summary: aiRoadmap?.parsed.headline ?? 'Personalized learning path',
                    aiPlan: aiRoadmap ? stringify(aiRoadmap.parsed) : undefined,
                    milestones: {
                        create: roadmapDraft.map((milestone, index) => ({
                            title: milestone.title,
                            description: milestone.description,
                            duration: milestone.duration,
                            status: milestone.status ?? 'PENDING',
                            resources: stringify(milestone.resources ?? []),
                            position: index,
                        })),
                    },
                },
                select: {
                    id: true,
                    title: true,
                    duration: true,
                    summary: true,
                    aiPlan: true,
                    milestones: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            duration: true,
                            status: true,
                            resources: true,
                            position: true,
                        },
                    },
                },
            });
            if (explanationAi) {
                await tx.insight.create({
                    data: {
                        userId: user.id,
                        source: 'GEMINI',
                        prompt: explanationAi.prompt,
                        response: explanationAi.raw,
                        summary: 'AI explanation of career matches',
                        type: 'CAREER_EXPLANATION',
                        metadata: stringify(explanationAi.parsed),
                    },
                });
            }
            if (aiRoadmap) {
                await tx.insight.create({
                    data: {
                        userId: user.id,
                        source: 'GEMINI',
                        prompt: aiRoadmap.prompt,
                        response: aiRoadmap.raw,
                        summary: 'AI generated roadmap plan',
                        type: 'ROADMAP',
                        metadata: stringify(aiRoadmap.parsed),
                    },
                });
            }
            let goalContract = null;
            if (goalAi && roadmap.milestones.length) {
                const firstMilestone = roadmap.milestones[0];
                goalContract = await tx.goalContract.create({
                    data: {
                        userId: user.id,
                        milestoneId: firstMilestone.id,
                        title: firstMilestone.title,
                        description: firstMilestone.description,
                        startDate: new Date(),
                        endDate: addDays(new Date(), parseDurationWeeks(firstMilestone.duration) * 7),
                        successCriteria: goalAi.parsed.successCriteria,
                        nudges: stringify(goalAi.parsed.weeklyNudges),
                        status: 'ACTIVE',
                    },
                    select: {
                        id: true,
                        milestoneId: true,
                        title: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                        successCriteria: true,
                        nudges: true,
                        status: true,
                    },
                });
                await tx.insight.create({
                    data: {
                        userId: user.id,
                        source: 'GEMINI',
                        prompt: goalAi.prompt,
                        response: goalAi.raw,
                        summary: `SMART goal created for ${firstMilestone.title}`,
                        type: 'TIP',
                        metadata: stringify(goalAi.parsed),
                    },
                });
            }
            return { quizResult, careerMatches, roadmap, goalContract };
        });
        const normalizedMatches = result.careerMatches.map((cm) => ({
            id: cm.id,
            title: cm.title,
            match_score: cm.matchScore,
            description: cm.description,
            avg_salary: cm.avgSalary,
            growth_rate: cm.growthRate,
            key_skills: JSON.parse(cm.keySkills),
        }));
        const normalizedRoadmap = {
            id: result.roadmap.id,
            title: result.roadmap.title,
            duration: result.roadmap.duration,
            summary: result.roadmap.summary,
            ai_plan: result.roadmap.aiPlan ? JSON.parse(result.roadmap.aiPlan) : undefined,
            milestones: result.roadmap.milestones
                .sort((a, b) => a.position - b.position)
                .map((milestone) => ({
                id: milestone.id,
                title: milestone.title,
                description: milestone.description,
                duration: milestone.duration,
                status: milestone.status,
                resources: JSON.parse(milestone.resources ?? '[]'),
            })),
        };
        return {
            user: { id: user.id, name: user.name, email: user.email },
            quizResultId: result.quizResult.id,
            summary,
            career_matches: normalizedMatches,
            learning_roadmap: normalizedRoadmap,
            goal_contract: result.goalContract,
            ai_insights: {
                explanation: explanationAi?.parsed,
                roadmap: aiRoadmap?.parsed,
                successCriteria: goalAi?.parsed,
            },
        };
    },
    async getLatestForUser(userId) {
        if (!userId) {
            throw new errorHandler_1.AppError('userId is required', 400);
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        const quizResult = await prisma_1.default.quizResult.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                careerMatches: true,
                roadmap: {
                    include: { milestones: true },
                },
            },
        });
        if (!quizResult) {
            throw new errorHandler_1.AppError('No assessment found for user', 404);
        }
        const goalContract = quizResult.roadmap?.milestones.length
            ? await prisma_1.default.goalContract.findFirst({
                where: {
                    milestoneId: {
                        in: quizResult.roadmap.milestones.map((milestone) => milestone.id),
                    },
                },
                orderBy: { createdAt: 'desc' },
            })
            : null;
        const insights = await prisma_1.default.insight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 25,
        });
        return {
            user: { id: user.id, name: user.name, email: user.email },
            quizResult: {
                id: quizResult.id,
                createdAt: quizResult.createdAt,
                summary: (0, json_1.safeParse)(quizResult.summary, {}),
                strengths: (0, json_1.safeParse)(quizResult.strengths, []),
                weaknesses: (0, json_1.safeParse)(quizResult.weaknesses, []),
            },
            career_matches: quizResult.careerMatches.map((match) => ({
                id: match.id,
                title: match.title,
                match_score: match.matchScore,
                description: match.description,
                avg_salary: match.avgSalary,
                growth_rate: match.growthRate,
                key_skills: (0, json_1.safeParse)(match.keySkills, []),
            })),
            learning_roadmap: quizResult.roadmap
                ? {
                    id: quizResult.roadmap.id,
                    title: quizResult.roadmap.title,
                    duration: quizResult.roadmap.duration,
                    summary: quizResult.roadmap.summary,
                    ai_plan: (0, json_1.safeParse)(quizResult.roadmap.aiPlan, null),
                    milestones: quizResult.roadmap.milestones
                        .sort((a, b) => a.position - b.position)
                        .map((milestone) => ({
                        id: milestone.id,
                        title: milestone.title,
                        description: milestone.description,
                        duration: milestone.duration,
                        status: milestone.status,
                        resources: (0, json_1.safeParse)(milestone.resources, []),
                    })),
                }
                : null,
            goal_contract: goalContract,
            ai_insights: insights.map((insight) => ({
                id: insight.id,
                summary: insight.summary,
                type: insight.type,
                createdAt: insight.createdAt,
                metadata: (0, json_1.safeParse)(insight.metadata, {}),
            })),
        };
    },
    async generateMicroTasks(userId) {
        if (!userId) {
            throw new errorHandler_1.AppError('userId is required', 400);
        }
        const quizResult = await prisma_1.default.quizResult.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        if (!quizResult) {
            throw new errorHandler_1.AppError('No assessment found for user', 404);
        }
        const summary = (0, json_1.safeParse)(quizResult.summary, {});
        const skillRatings = summary?.skillRatings ?? {};
        const skillEntries = Object.entries(skillRatings).map(([name, rawScore]) => ({
            name,
            score: typeof rawScore === 'number' ? rawScore : Number(rawScore) || 0,
        }));
        if (!skillEntries.length) {
            throw new errorHandler_1.AppError('Skill ratings missing for this user', 400);
        }
        const weakSkills = skillEntries
            .filter((entry) => entry.score <= 3)
            .sort((a, b) => a.score - b.score)
            .slice(0, 4);
        const prioritizedSkills = weakSkills.length
            ? weakSkills
            : skillEntries.sort((a, b) => a.score - b.score).slice(0, Math.min(skillEntries.length, 3));
        if (!prioritizedSkills.length) {
            throw new errorHandler_1.AppError('Unable to determine skills for micro-coaching', 400);
        }
        const aiResponse = await geminiService_1.geminiService.recommendMicroTasks({
            weakSkills: prioritizedSkills.map((skill) => ({ name: skill.name, score: skill.score })),
        });
        const insight = await prisma_1.default.insight.create({
            data: {
                userId,
                source: 'GEMINI',
                prompt: aiResponse.prompt,
                response: aiResponse.raw,
                summary: 'AI micro-coach tasks generated',
                type: 'MICRO_TASKS',
                metadata: stringify(aiResponse.parsed),
            },
            select: {
                id: true,
                createdAt: true,
            },
        });
        return {
            quizResultId: quizResult.id,
            weakSkills: prioritizedSkills,
            heatmap: aiResponse.parsed.heatmap,
            microTasks: aiResponse.parsed.microTasks,
            insightId: insight.id,
            generatedAt: insight.createdAt,
        };
    },
};
