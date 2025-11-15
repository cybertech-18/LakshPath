import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { safeParse } from '@utils/json';

export const insightService = {
  async listForUser(userId: string) {
    if (!userId) throw new AppError('userId is required', 400);

    const insights = await prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return insights.map((insight: {
      id: string;
      summary: string;
      type: string;
      createdAt: Date;
      prompt: string;
      metadata: string | null;
    }) => ({
      id: insight.id,
      summary: insight.summary,
      type: insight.type,
      createdAt: insight.createdAt,
      prompt: insight.prompt,
      metadata: safeParse(insight.metadata, {}),
    }));
  },
};
