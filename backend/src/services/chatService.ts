import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import { AppError } from '@middleware/errorHandler';
import { safeParse, safeStringify } from '@utils/json';
import { MentorChatRequest } from '@shared-types/ai';
import { DOMAIN_THEMES, DomainKey } from '@lib/domainThemes';

interface MentorChatPayload {
  userId: string;
  round: 'career' | 'interview' | 'scholarship';
  message: string;
  context?: Record<string, unknown>;
}

const DEFAULT_DOMAIN: DomainKey = 'Technology & Software';

const isForeignKeyConstraintError = (error: unknown): error is { code: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2003'
  );
};

const buildMentorContext = async (
  userId: string,
  baseContext: MentorChatRequest['context'] = {}
): Promise<MentorChatRequest['context']> => {
  const [quizResult, recentInsights] = await Promise.all([
    prisma.quizResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const summary = safeParse<Record<string, unknown>>(quizResult?.summary, {});
  const domainFocus = (summary?.fieldInterest as string) || DEFAULT_DOMAIN;
  const domainTheme = DOMAIN_THEMES[domainFocus as DomainKey] || DOMAIN_THEMES.default;
  const domainInterests = (summary?.domainInterests as Record<string, number>) ?? undefined;

  const insightHighlights = recentInsights.map((insight: { type: string; summary: string; metadata: string | null }) => {
    const metadata = safeParse<Record<string, unknown>>(insight.metadata, {});
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

export const chatService = {
  async mentorRound(payload: MentorChatPayload) {
    if (!payload.userId) throw new AppError('userId is required', 400);
    if (!payload.message) throw new AppError('message is required', 400);

    const context = payload.context ?? {};
    const enrichedContext = await buildMentorContext(payload.userId, context as MentorChatRequest['context']);

    const request: MentorChatRequest = {
      round: payload.round,
      message: payload.message,
      context: enrichedContext,
    };

    const aiResponse = await geminiService.mentorChat(request);

    const replySummary = aiResponse.parsed.headline ?? `AI mentor (${payload.round}) reply`;

    try {
      await prisma.insight.create({
        data: {
          userId: payload.userId,
          source: 'GEMINI',
          prompt: aiResponse.prompt,
          response: aiResponse.raw,
          summary: replySummary,
          type: 'CHAT',
          metadata: safeStringify({ message: payload.message, reply: aiResponse.parsed }),
        },
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        console.warn(`[chatService] Skipping insight persistence for missing user ${payload.userId}`);
      } else {
        throw error;
      }
    }

    return aiResponse.parsed;
  },
};
