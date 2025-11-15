import { GoogleGenerativeAI, type GenerateContentRequest } from '@google/generative-ai';

import env from '@config/env';
import {
  CareerExplanationRequest,
  CareerExplanationResponse,
  RoadmapRequest,
  RoadmapResponse,
  GoalSuccessCriteriaRequest,
  GoalSuccessCriteriaResponse,
  JDComparatorRequest,
  JDComparatorResponse,
  SkillMicroTaskRequest,
  SkillMicroTaskResponse,
  MentorChatRequest,
  MentorChatResponse,
  MarketBriefResponse,
} from '@shared-types/ai';
import { AppError } from '@middleware/errorHandler';

export interface GeminiResult<T> {
  prompt: string;
  raw: string;
  parsed: T;
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const reasoningModel = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

type GeminiCallOptions = {
  responseMimeType?: string;
  temperature?: number;
};

const parseJson = <T>(rawText: string): T => {
  try {
    const cleaned = rawText
      .replace(/^```json/gm, '')
      .replace(/```$/gm, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new AppError('Failed to parse Gemini response', 502, error);
  }
};

const callGemini = async (prompt: string, options?: GeminiCallOptions) => {
  try {
    const request: GenerateContentRequest = {
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
      throw new AppError('Empty response from Gemini', 502);
    }
    return response.text();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Gemini API error', 502, error);
  }
};

export const geminiService = {
  async explainCareers(payload: CareerExplanationRequest): Promise<GeminiResult<CareerExplanationResponse>> {
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
    return { prompt, raw, parsed: parseJson<CareerExplanationResponse>(raw) };
  },

  async generateRoadmap(payload: RoadmapRequest): Promise<GeminiResult<RoadmapResponse>> {
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
    return { prompt, raw, parsed: parseJson<RoadmapResponse>(raw) };
  },

  async goalSuccessCriteria(payload: GoalSuccessCriteriaRequest): Promise<GeminiResult<GoalSuccessCriteriaResponse>> {
    const prompt = `Craft SMART success criteria and weekly nudges for this milestone.
Return JSON with { "successCriteria": "", "weeklyNudges": [] }
MILESTONE: ${JSON.stringify(payload, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<GoalSuccessCriteriaResponse>(raw) };
  },

  async compareJobDescription(payload: JDComparatorRequest): Promise<GeminiResult<JDComparatorResponse>> {
    const prompt = `Compare this job description with the student's profile and roadmap.
Return JSON { "summary": "", "matches": [], "gaps": [], "fastTrackMilestones": [], "suggestions": [] }
JOB: ${JSON.stringify(payload, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<JDComparatorResponse>(raw) };
  },

  async recommendMicroTasks(payload: SkillMicroTaskRequest): Promise<GeminiResult<SkillMicroTaskResponse>> {
    const prompt = `For each weak skill, create a sentiment and three bite-sized learning tasks.
Return JSON { "heatmap": [{"name":"","score":0,"sentiment":""}], "microTasks": [{"skill":"","title":"","description":"","resourceUrl":""}] }
WEAK_SKILLS: ${JSON.stringify(payload.weakSkills, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<SkillMicroTaskResponse>(raw) };
  },

  async mentorChat(payload: MentorChatRequest): Promise<GeminiResult<MentorChatResponse>> {
    const prompt = `You are an AI mentor helping with the ${payload.round} round. Answer with confident, actionable guidance.
Return strict JSON with this shape:
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
  "references": string[]
}
Always include at least two actionPlan entries and one follow-up question. Use clear, short sentences.
CONTEXT: ${JSON.stringify(payload.context, null, 2)}
QUESTION: ${payload.message}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<MentorChatResponse>(raw) };
  },

  async marketBrief(payload: { snapshots: string[] }): Promise<GeminiResult<MarketBriefResponse>> {
    const prompt = `Summarize these labor market signals in under 120 words with three recommendations.
Return JSON { "title": "", "deltaSummary": "", "recommendations": [] }
DATA: ${JSON.stringify(payload.snapshots, null, 2)}
`;
    const raw = await callGemini(prompt, { responseMimeType: 'application/json' });
    return { prompt, raw, parsed: parseJson<MarketBriefResponse>(raw) };
  },
};
