"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentorService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geminiService_1 = require("./geminiService");
const errorHandler_1 = require("../middleware/errorHandler");
const json_1 = require("../utils/json");
const domainThemes_1 = require("../lib/domainThemes");
const DEFAULT_DOMAIN = 'Technology & Software';
const getSkillLevel = (score) => {
    if (score >= 4.5)
        return 'Expert';
    if (score >= 4)
        return 'Advanced';
    if (score >= 3)
        return 'Intermediate';
    if (score >= 2)
        return 'Beginner';
    return 'Novice';
};
const analyzeUserProfile = async (userId) => {
    const [quizResult, careerMatches, roadmap, insights, goalContracts] = await Promise.all([
        prisma_1.default.quizResult.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.default.careerMatch.findMany({
            where: { quizResult: { userId } },
            orderBy: { matchScore: 'desc' },
            take: 5,
        }),
        prisma_1.default.learningRoadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { milestones: { orderBy: { position: 'asc' } } },
        }),
        prisma_1.default.insight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        prisma_1.default.goalContract.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        }),
    ]);
    if (!quizResult) {
        throw new errorHandler_1.AppError('User has not completed assessment yet', 404);
    }
    const summary = (0, json_1.safeParse)(quizResult.summary, {});
    const skillRatings = summary?.skillRatings || {};
    const strengths = (0, json_1.safeParse)(quizResult.strengths, []);
    const weaknesses = (0, json_1.safeParse)(quizResult.weaknesses, []);
    const technical = skillRatings.technical || 0;
    const communication = skillRatings.communication || 0;
    const analytical = skillRatings.analytical || 0;
    const creativity = skillRatings.creativity || 0;
    const domainFocus = summary?.fieldInterest || DEFAULT_DOMAIN;
    const motivation = summary?.motivation || 'career growth';
    const workStyle = summary?.workStyle || 'balanced';
    const currentMilestone = roadmap?.milestones.find(m => m.status === 'IN_PROGRESS');
    const completedMilestones = roadmap?.milestones.filter(m => m.status === 'COMPLETED').length || 0;
    const pendingMilestones = roadmap?.milestones.filter(m => m.status === 'PENDING').length || 0;
    const activeGoals = goalContracts.filter(g => g.status === 'ACTIVE');
    const completedGoals = goalContracts.filter(g => g.status === 'COMPLETED');
    const recentInsightHighlights = insights.slice(0, 5).map(i => i.summary);
    // Analyze patterns from insights
    const insightTypes = insights.map(i => i.type);
    const patterns = [];
    if (insightTypes.filter(t => t === 'CHAT').length > 5) {
        patterns.push('Actively seeks guidance through mentor conversations');
    }
    if (insightTypes.filter(t => t === 'MICRO_TASKS').length > 0) {
        patterns.push('Working on skill improvement tasks');
    }
    if (completedGoals.length > 0) {
        patterns.push(`Completed ${completedGoals.length} goal contract(s)`);
    }
    // Generate focus areas based on analysis
    const focusAreas = [];
    const actionPlan = [];
    const resources = [];
    if (technical < 3) {
        focusAreas.push('Technical Foundations');
        actionPlan.push('Start with fundamentals through structured courses');
        resources.push('Consider platforms like Coursera, freeCodeCamp for basics');
    }
    if (communication < 3) {
        focusAreas.push('Communication & Presentation');
        actionPlan.push('Practice articulating ideas through writing or presentations');
        resources.push('Join public speaking clubs or write technical blogs');
    }
    if (analytical < 3) {
        focusAreas.push('Problem Solving & Analysis');
        actionPlan.push('Solve case studies and practice structured thinking');
        resources.push('Use LeetCode, HackerRank, or business case platforms');
    }
    if (creativity < 3) {
        focusAreas.push('Creative Thinking');
        actionPlan.push('Engage in design thinking exercises or creative projects');
        resources.push('Explore design sprints, brainstorming workshops');
    }
    if (activeGoals.length === 0 && pendingMilestones > 0) {
        actionPlan.push('Set up a goal contract for your next milestone');
    }
    if (insights.length < 3) {
        actionPlan.push('Engage more with the AI mentor to unlock personalized insights');
    }
    return {
        userId,
        quizResultId: quizResult.id,
        personality: {
            type: `${getSkillLevel((technical + communication + analytical + creativity) / 4)} Learner`,
            strengths,
            weaknesses,
            workStyle,
            motivation,
        },
        skills: {
            technical: { score: technical, level: getSkillLevel(technical), needsWork: technical < 3 },
            communication: { score: communication, level: getSkillLevel(communication), needsWork: communication < 3 },
            analytical: { score: analytical, level: getSkillLevel(analytical), needsWork: analytical < 3 },
            creativity: { score: creativity, level: getSkillLevel(creativity), needsWork: creativity < 3 },
        },
        career: {
            topMatches: careerMatches.map(m => ({
                title: m.title,
                score: m.matchScore,
                keySkills: (0, json_1.safeParse)(m.keySkills, []),
            })),
            domainFocus,
            growthPotential: careerMatches[0] ? `${careerMatches[0].growthRate || 'Steady'} growth in ${careerMatches[0].title}` : 'Strong potential',
        },
        roadmap: {
            currentMilestone: currentMilestone?.title || 'Not started',
            completedTasks: completedMilestones,
            pendingTasks: pendingMilestones,
            nextSteps: currentMilestone ? [currentMilestone.description] : ['Start your first milestone'],
        },
        insights: {
            recent: recentInsightHighlights,
            patterns,
        },
        mentorRecommendations: {
            focusAreas,
            actionPlan,
            resources,
        },
    };
};
const buildEnhancedContext = async (userId, sessionType, baseContext = {}) => {
    const analysis = await analyzeUserProfile(userId);
    const domainTheme = domainThemes_1.DOMAIN_THEMES[analysis.career.domainFocus] || domainThemes_1.DOMAIN_THEMES.default;
    return {
        ...baseContext,
        name: analysis.personality.type,
        education: 'In progress',
        strengths: analysis.personality.strengths,
        weaknesses: analysis.personality.weaknesses,
        preferredWorkStyle: analysis.personality.workStyle,
        motivation: analysis.personality.motivation,
        skillRatings: {
            technical: analysis.skills.technical.score,
            communication: analysis.skills.communication.score,
            analytical: analysis.skills.analytical.score,
            creativity: analysis.skills.creativity.score,
        },
        currentCareerGoal: analysis.career.topMatches[0]?.title,
        recentMilestones: [analysis.roadmap.currentMilestone],
        domainFocus: analysis.career.domainFocus,
        domainTheme: {
            mission: domainTheme.mission,
            personalityTag: domainTheme.personalityTag,
            aiHook: domainTheme.aiHook,
            tone: domainTheme.tone || 'supportive',
        },
        assessmentSummary: {
            skillLevels: {
                technical: analysis.skills.technical.level,
                communication: analysis.skills.communication.level,
                analytical: analysis.skills.analytical.level,
                creativity: analysis.skills.creativity.level,
            },
            focusAreas: analysis.mentorRecommendations.focusAreas,
            careerPath: analysis.career.topMatches[0]?.title,
            progress: {
                completed: analysis.roadmap.completedTasks,
                pending: analysis.roadmap.pendingTasks,
            },
        },
        recentInsights: analysis.insights.recent,
    };
};
const generateMentorPrompt = (sessionType, message, context, analysis) => {
    // Detect greeting messages
    const greetings = ['hi', 'hello', 'hey', 'hlo', 'hola', 'greetings', 'good morning', 'good evening'];
    const isGreeting = greetings.some(g => message.toLowerCase().trim() === g || message.toLowerCase().trim().startsWith(g + ' '));
    const basePrompt = `You are an experienced, friendly AI Career Mentor for LakshPath named "Laksh". You provide personalized, actionable guidance based on deep analysis of the user's assessment, skills, and progress.

IMPORTANT CONTEXT-AWARENESS:
- If the user is greeting you (hi, hello, hey, etc.), respond warmly and give them an overview of their current journey
- For greetings, focus on: welcoming them back, highlighting recent progress, suggesting what to discuss
- For specific questions, provide detailed, actionable guidance
- Always be conversational and engaging, not robotic

SESSION TYPE: ${sessionType.toUpperCase()}

USER PROFILE SNAPSHOT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Profile: ${analysis.personality.type}
🎯 Career Goal: ${analysis.career.topMatches[0]?.title || 'Exploring options'}
📊 Domain: ${analysis.career.domainFocus}
💪 Top Strengths: ${analysis.personality.strengths.slice(0, 2).join(', ')}
🎓 Current Focus: ${analysis.roadmap.currentMilestone}
✅ Completed: ${analysis.roadmap.completedTasks} | ⏳ Pending: ${analysis.roadmap.pendingTasks}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SKILL LEVELS (1-5 scale):
┌─────────────────┬───────┬──────────────┐
│ Skill           │ Score │ Status       │
├─────────────────┼───────┼──────────────┤
│ Technical       │ ${analysis.skills.technical.score}/5  │ ${analysis.skills.technical.level.padEnd(12)} │
│ Communication   │ ${analysis.skills.communication.score}/5  │ ${analysis.skills.communication.level.padEnd(12)} │
│ Analytical      │ ${analysis.skills.analytical.score}/5  │ ${analysis.skills.analytical.level.padEnd(12)} │
│ Creativity      │ ${analysis.skills.creativity.score}/5  │ ${analysis.skills.creativity.level.padEnd(12)} │
└─────────────────┴───────┴──────────────┘

${analysis.mentorRecommendations.focusAreas.length > 0 ? `
PRIORITY FOCUS AREAS:
${analysis.mentorRecommendations.focusAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}
` : ''}

${analysis.insights.patterns.length > 0 ? `
ENGAGEMENT PATTERNS:
${analysis.insights.patterns.map(p => `• ${p}`).join('\n')}
` : ''}

${context.recentInsights && context.recentInsights.length > 0 ? `
RECENT ACTIVITY:
${context.recentInsights.slice(0, 3).map((i, idx) => `${idx + 1}. ${i}`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR MENTORING STYLE:
1. 🗣️ CONVERSATIONAL - Talk like a real mentor, not a bot. Be warm and encouraging.
2. 🎯 CONTEXT-AWARE - ${isGreeting ? 'They are greeting you! Welcome them warmly and give a brief status update.' : 'They have a specific question. Provide detailed, actionable guidance.'}
3. 💡 INSIGHTFUL - Reference their specific progress, skills, and patterns you observe
4. 🚀 ACTIONABLE - Always include concrete next steps they can take today
5. 🎨 ADAPTIVE - Match your tone to their motivation: ${analysis.personality.motivation}
6. 📈 GROWTH-FOCUSED - Celebrate wins, address gaps honestly, push them forward

${isGreeting ? `
GREETING RESPONSE GUIDELINES:
- Welcome them warmly by name or as "friend"
- Give a quick status: "You're at [current milestone], [completed] down, [pending] to go!"
- Highlight ONE key strength to boost confidence
- Mention ONE priority area for this week
- Ask what they'd like to focus on today
- Keep it brief (2-3 sentences max in summary)
- Action plan should be light (1-2 quick wins)
- Tone should be "encouraging" and energetic
` : `
DETAILED RESPONSE GUIDELINES:
- Address their specific question directly
- Reference relevant parts of their profile
- Provide 2-4 actionable steps with priorities
- Connect advice to their career goal: ${analysis.career.topMatches[0]?.title}
- Include specific resources or examples
- Add follow-up questions to deepen the conversation
`}

RETURN FORMAT (strict JSON):
{
  "headline": "${isGreeting ? 'Welcome back! Here\'s where you stand' : 'Brief, impactful title addressing their question'}",
  "summary": "${isGreeting ? '1-2 friendly sentences welcoming them and giving quick status' : '2-3 sentences with specific, actionable guidance'}",
  "actionPlan": [
    {
      "title": "Clear action title",
      "detail": "Specific steps they can take",
      "impact": "Why this matters for their ${analysis.career.topMatches[0]?.title || 'career'} goal",
      "priority": "high" | "medium" | "low"
    }
  ],
  "followUps": [
    {
      "question": "${isGreeting ? 'What would you like to focus on today?' : 'Thought-provoking question to deepen learning'}",
      "why": "Why this question matters for their growth"
    }
  ],
  "nudges": [
    "Quick, specific actions they can do TODAY (not generic)"
  ],
  "confidence": ${isGreeting ? '1.0' : '0.7 to 1.0 (based on how well you can answer)'},
  "references": ["${isGreeting ? 'Keep this empty for greetings' : 'Specific courses, tools, articles, or resources'}"],
  "tone": "${isGreeting ? 'encouraging' : 'Choose: supportive, challenging, encouraging, or direct'}"
}

USER MESSAGE: "${message}"

Remember: You're Laksh, their dedicated mentor who knows their journey. Be warm, specific, and actionable. Make every interaction feel personal and valuable.`;
    return basePrompt;
};
exports.mentorService = {
    async analyzeUser(userId) {
        return analyzeUserProfile(userId);
    },
    async startMentorSession(userId, sessionType, initialMessage) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        if (!initialMessage)
            throw new errorHandler_1.AppError('message is required', 400);
        const analysis = await analyzeUserProfile(userId);
        const context = await buildEnhancedContext(userId, sessionType, {});
        const prompt = generateMentorPrompt(sessionType, initialMessage, context, analysis);
        const aiResponse = await geminiService_1.geminiService.mentorChat({
            round: sessionType === 'interview_prep' ? 'interview' : 'career',
            message: initialMessage,
            context,
        });
        // Save the session
        const sessionId = `mentor_${Date.now()}_${userId}`;
        await prisma_1.default.insight.create({
            data: {
                userId,
                source: 'MENTOR_AI',
                prompt,
                response: (0, json_1.safeStringify)(aiResponse.parsed),
                summary: aiResponse.parsed.headline,
                type: 'MENTOR_SESSION',
                metadata: (0, json_1.safeStringify)({
                    sessionId,
                    sessionType,
                    analysis: {
                        skillLevels: analysis.skills,
                        focusAreas: analysis.mentorRecommendations.focusAreas,
                    },
                    userMessage: initialMessage,
                    mentorResponse: aiResponse.parsed,
                }),
            },
        });
        return {
            sessionId,
            analysis,
            response: aiResponse.parsed,
            actionItems: aiResponse.parsed.actionPlan.map(a => a.title),
            context,
        };
    },
    async continueMentorChat(userId, message, sessionContext) {
        if (!userId)
            throw new errorHandler_1.AppError('userId is required', 400);
        if (!message)
            throw new errorHandler_1.AppError('message is required', 400);
        const analysis = await analyzeUserProfile(userId);
        const context = await buildEnhancedContext(userId, 'career_guidance', sessionContext);
        const prompt = generateMentorPrompt('career_guidance', message, context, analysis);
        const aiResponse = await geminiService_1.geminiService.mentorChat({
            round: 'career',
            message,
            context,
        });
        await prisma_1.default.insight.create({
            data: {
                userId,
                source: 'MENTOR_AI',
                prompt,
                response: (0, json_1.safeStringify)(aiResponse.parsed),
                summary: aiResponse.parsed.headline,
                type: 'CHAT',
                metadata: (0, json_1.safeStringify)({
                    userMessage: message,
                    mentorResponse: aiResponse.parsed,
                }),
            },
        });
        return {
            analysis,
            response: aiResponse.parsed,
        };
    },
    async getMentorHistory(userId, limit = 10) {
        const sessions = await prisma_1.default.insight.findMany({
            where: {
                userId,
                type: { in: ['MENTOR_SESSION', 'CHAT'] },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                summary: true,
                type: true,
                metadata: true,
                createdAt: true,
            },
        });
        return sessions.map(session => ({
            id: session.id,
            summary: session.summary,
            type: session.type,
            metadata: (0, json_1.safeParse)(session.metadata, {}),
            createdAt: session.createdAt,
        }));
    },
};
