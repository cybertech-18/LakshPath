"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = __importDefault(require("../config/env"));
const errorHandler_1 = require("../middleware/errorHandler");
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.default.GEMINI_API_KEY);
const reasoningModel = genAI.getGenerativeModel({ model: env_1.default.GEMINI_MODEL });
const parseJson = (rawText) => {
    try {
        const cleaned = rawText
            .replace(/^```json/gm, '')
            .replace(/```$/gm, '')
            .trim();
        return JSON.parse(cleaned);
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to parse Gemini response', 502, error);
    }
};
const callGemini = async (prompt, options, retries = 2) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const request = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
            };
            if (options && (options.responseMimeType || options.temperature !== undefined)) {
                request.generationConfig = {
                    ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
                    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
                };
            }
            const result = await reasoningModel.generateContent(request);
            const response = result.response;
            if (!response) {
                throw new errorHandler_1.AppError('Empty response from Gemini', 502);
            }
            return response.text();
        }
        catch (error) {
            lastError = error;
            // Check if it's a rate limit error (429)
            const isRateLimit = error?.status === 429 || error?.statusCode === 429 ||
                error?.message?.includes('429') || error?.message?.includes('quota');
            if (isRateLimit && attempt < retries) {
                // Wait with exponential backoff: 1s, 2s, 4s
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`[Gemini] Rate limit hit, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            // If not rate limit or out of retries, throw error
            break;
        }
    }
    // If we get here, all retries failed
    if (lastError instanceof errorHandler_1.AppError)
        throw lastError;
    throw new errorHandler_1.AppError('Gemini API error', 502, lastError);
};
exports.geminiService = {
    async explainCareers(payload) {
        const prompt = `You are an AI career coach. Given the student's profile and their top matches, explain why each career fits.
Return JSON with this shape:
{
  "careers": [
    {
      "title": "",
      "whyItFits": "",
      "strengths": [],
      "weaknesses": [],
      "personalizedAdvice": ""
    }
  ]
}

PROFILE: ${JSON.stringify(payload.profile, null, 2)}
QUIZ_INSIGHTS: ${JSON.stringify(payload.quizInsights, null, 2)}
TOP_CAREERS: ${JSON.stringify(payload.topCareers, null, 2)}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async generateRoadmap(payload) {
        const prompt = `Design a month-wise ${payload.durationMonths ?? 6}-month learning roadmap for a ${payload.seniority} aiming to become ${payload.careerTitle}.
Return JSON with:
{
  "headline": "",
  "months": [
    { "month": 1, "theme": "", "skills": [], "resources": [], "project": "" }
  ]
}

PROFILE: ${JSON.stringify(payload.profile, null, 2)}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async goalSuccessCriteria(payload) {
        const prompt = `Craft SMART success criteria and weekly nudges for this milestone.
Return JSON with { "successCriteria": "", "weeklyNudges": [] }
MILESTONE: ${JSON.stringify(payload, null, 2)}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async compareJobDescription(payload) {
        const prompt = `Compare this job description with the student's profile and roadmap.
Return JSON { "summary": "", "matches": [], "gaps": [], "fastTrackMilestones": [], "suggestions": [] }
JOB: ${JSON.stringify(payload, null, 2)}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async recommendMicroTasks(payload) {
        const prompt = `For each weak skill, create a sentiment and three bite-sized learning tasks.
Return JSON { "heatmap": [{"name":"","score":0,"sentiment":""}], "microTasks": [{"skill":"","title":"","description":"","resourceUrl":""}] }
WEAK_SKILLS: ${JSON.stringify(payload.weakSkills, null, 2)}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async mentorChat(payload) {
        const prompt = `You are "Laksh", a warm, experienced AI Career Mentor. You know this user deeply and provide personalized guidance.

CONVERSATION TYPE: ${payload.round}

USER CONTEXT:
${JSON.stringify(payload.context, null, 2)}

YOUR PERSONALITY:
- Warm and conversational (like talking to a friend who's also a career expert)
- Insightful (notice patterns and connect dots from their journey)
- Actionable (always give concrete next steps)
- Encouraging but honest (celebrate wins, address gaps truthfully)
- Adaptive (match tone to user's needs and message type)

RESPONSE GUIDELINES:
1. If they're greeting you (hi, hello, hey), be warm and give a quick status update
2. For specific questions, provide detailed, actionable guidance
3. Always reference their actual skills, progress, and goals (not generic advice)
4. Action plans should be specific to THEIR situation
5. Nudges should be micro-actions they can do TODAY
6. Follow-ups should push their thinking forward
7. Keep summary conversational (like you're speaking, not writing an essay)

Return strict JSON:
{
  "headline": string,
  "summary": string,
  "actionPlan": [
    { "title": string, "detail": string, "impact": string, "priority": "low" | "medium" | "high" }
  ],
  "followUps": [
    { "question": string, "why": string }
  ],
  "nudges": string[],
  "confidence": number between 0 and 1,
  "references": string[],
  "tone": "supportive" | "challenging" | "encouraging" | "direct"
}

USER MESSAGE: ${payload.message}

Respond as Laksh, their dedicated mentor who truly knows their journey. Make them feel seen and motivated.`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.8 });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async marketBrief(payload) {
        const prompt = `Summarize these labor market signals in under 120 words with three recommendations.
Return JSON { "title": "", "deltaSummary": "", "recommendations": [] }
DATA: ${JSON.stringify(payload.snapshots, null, 2)}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    // ============================================
    // INTERVIEW PRACTICE AI METHODS
    // ============================================
    async generateInterviewQuestions(payload) {
        const count = payload.count || 5;
        const prompt = `You are an expert technical interviewer. Generate ${count} ${payload.difficulty} ${payload.type} interview questions for a ${payload.role || 'Software Engineer'} role.

${payload.profile ? `CANDIDATE PROFILE: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON with this structure:
{
  "questions": [
    {
      "questionText": "",
      "questionType": "${payload.type}",
      "difficulty": "${payload.difficulty}",
      "expectedAnswer": "",
      "evaluationCriteria": [],
      "hints": []
    }
  ]
}

GUIDELINES:
- For TECHNICAL: focus on concepts, algorithms, system design
- For BEHAVIORAL: use STAR method scenarios (Situation, Task, Action, Result)
- For CODING: include problem statement, constraints, examples
- For SYSTEM_DESIGN: real-world scalability problems
- Make questions relevant to the candidate's level and profile
- Expected answers should be comprehensive but concise
- Include 2-3 evaluation criteria per question
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async evaluateInterviewAnswer(payload) {
        const prompt = `You are an expert interviewer evaluating a candidate's answer. Be constructive but honest.

QUESTION: ${payload.questionText}
QUESTION TYPE: ${payload.questionType}
${payload.expectedAnswer ? `EXPECTED ANSWER: ${payload.expectedAnswer}` : ''}
USER'S ANSWER: ${payload.userAnswer}
${payload.profile ? `CANDIDATE PROFILE: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON with this structure:
{
  "score": 0-100,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  ${payload.questionType === 'BEHAVIORAL' ? `"starAnalysis": {
    "situation": "",
    "task": "",
    "action": "",
    "result": "",
    "score": 0-100
  },` : ''}
  ${payload.questionType === 'CODING' ? `"codeQuality": {
    "timeComplexity": "",
    "spaceComplexity": "",
    "codeStyle": "",
    "edgeCases": [],
    "score": 0-100
  }` : ''}
}

EVALUATION CRITERIA:
- Accuracy and completeness
- Communication clarity
- Problem-solving approach
- Technical depth
${payload.questionType === 'BEHAVIORAL' ? '- STAR method structure (Situation, Task, Action, Result)' : ''}
${payload.questionType === 'CODING' ? '- Code efficiency, readability, edge case handling' : ''}
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    async analyzeSpeech(payload) {
        const prompt = `Analyze this interview transcript for speech quality.

TRANSCRIPT: ${payload.transcript}
DURATION: ${payload.duration} seconds

Return JSON:
{
  "confidence": 0-100,
  "fillerWords": [{"word": "", "count": 0}],
  "pace": "TOO_FAST" | "GOOD" | "TOO_SLOW",
  "clarity": 0-100,
  "suggestions": []
}

Analyze:
- Filler words (um, uh, like, you know, etc.)
- Speaking pace (words per minute, normal is 130-150)
- Confidence indicators (hesitations, incomplete thoughts)
- Clarity (sentence structure, coherence)
- Provide 3-5 actionable suggestions
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    // ============================================
    // PORTFOLIO / GITHUB ANALYSIS AI METHODS
    // ============================================
    async analyzePortfolio(payload) {
        const prompt = `You are a senior software engineer reviewing a candidate's portfolio/GitHub for a ${payload.targetRole || 'Software Engineer'} position.

${payload.repositories ? `REPOSITORIES: ${JSON.stringify(payload.repositories, null, 2)}` : ''}
${payload.profile ? `CANDIDATE PROFILE: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON:
{
  "overallScore": 0-100,
  "codeQualityScore": 0-100,
  "diversityScore": 0-100,
  "contributionScore": 0-100,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingProjectTypes": [],
  "recommendations": [
    {
      "title": "",
      "priority": "LOW" | "MEDIUM" | "HIGH",
      "description": "",
      "impact": ""
    }
  ],
  "repositoryInsights": [
    {
      "repoName": "",
      "score": 0-100,
      "codeQualityScore": 0-100,
      "complexity": "LOW" | "MEDIUM" | "HIGH",
      "readmeQuality": "POOR" | "GOOD" | "EXCELLENT",
      "improvements": [],
      "highlights": []
    }
  ]
}

EVALUATE:
- Code Quality: documentation, tests, CI/CD, code organization
- Diversity: variety of technologies, project types, problem domains
- Contribution Patterns: commit frequency, issue involvement, collaboration
- README Quality: clear description, setup instructions, screenshots
- Missing Elements: What types of projects would strengthen their portfolio for the target role?
- Actionable Recommendations: specific, prioritized improvements
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
    // ============================================
    // LINKEDIN PROFILE OPTIMIZER AI METHODS
    // ============================================
    async optimizeLinkedInProfile(payload) {
        const prompt = `You are a professional career coach and LinkedIn expert. Optimize this profile for a ${payload.targetRole || 'Software Engineer'} role${payload.targetIndustry ? ` in ${payload.targetIndustry}` : ''}.

CURRENT PROFILE:
${payload.currentHeadline ? `Headline: ${payload.currentHeadline}` : 'No headline'}
${payload.currentAbout ? `About: ${payload.currentAbout}` : 'No about section'}
${payload.currentExperience ? `Experience: ${JSON.stringify(payload.currentExperience, null, 2)}` : 'No experience'}
${payload.skills ? `Skills: ${payload.skills.join(', ')}` : 'No skills listed'}
${payload.profile ? `Additional Context: ${JSON.stringify(payload.profile, null, 2)}` : ''}

Return JSON:
{
  "optimizedHeadline": "",
  "optimizedAbout": "",
  ${payload.currentExperience ? `"optimizedExperience": [
    {
      "title": "",
      "company": "",
      "duration": "",
      "optimizedDescription": "",
      "optimizedAchievements": [],
      "improvements": []
    }
  ],` : ''}
  "keywords": [],
  "overallScore": 0-100,
  "beforeScore": 0-100,
  "afterScore": 0-100,
  "improvements": [
    {
      "category": "",
      "before": "",
      "after": "",
      "reason": ""
    }
  ],
  "missingElements": [],
  "atsOptimizationTips": []
}

OPTIMIZATION GUIDELINES:
- Headline: Include role, key skills, value proposition (120 chars max)
- About: Engaging story, achievements, call-to-action (2000 chars max)
- Experience: Start with action verbs, quantify achievements, show impact
- Keywords: ATS-optimized keywords for target role
- Use industry-standard terminology
- Highlight results and metrics (increased X by Y%)
- Make it human and authentic, not robotic
- Ensure it passes ATS (Applicant Tracking Systems)
`;
        const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
        return { prompt, raw, parsed: parseJson(raw) };
    },
};
