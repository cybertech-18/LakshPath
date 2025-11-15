import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { safeParse } from '@utils/json';

const profileSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const mapQuizSummary = (summary?: string | null) => {
  if (!summary) return null;
  return safeParse<Record<string, unknown>>(summary, {});
};

export const userService = {
  async getProfile(userId: string) {
    if (!userId) throw new AppError('userId is required', 400);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: profileSelect });
    if (!user) throw new AppError('User not found', 404);

    const [latestQuiz, roadmap] = await Promise.all([
      prisma.quizResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          summary: true,
          strengths: true,
          weaknesses: true,
        },
      }),
      prisma.learningRoadmap.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          duration: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      profile: user,
      latestAssessment: latestQuiz
        ? {
            id: latestQuiz.id,
            createdAt: latestQuiz.createdAt,
            summary: mapQuizSummary(latestQuiz.summary),
            strengths: mapQuizSummary(latestQuiz.strengths),
            weaknesses: mapQuizSummary(latestQuiz.weaknesses),
          }
        : null,
      activeRoadmap: roadmap,
    };
  },

  async updateProfile(
    userId: string,
    payload: {
      name?: string;
      avatarUrl?: string;
    }
  ) {
    if (!userId) throw new AppError('userId is required', 400);

    const updates: Record<string, string> = {};
    if (typeof payload.name === 'string') {
      updates.name = payload.name.trim();
    }
    if (typeof payload.avatarUrl === 'string') {
      updates.avatarUrl = payload.avatarUrl.trim();
    }

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields provided', 400);
    }

    const user = await prisma.user.update({ where: { id: userId }, data: updates, select: profileSelect });
    return { profile: user };
  },

  async getProgress(userId: string) {
    if (!userId) throw new AppError('userId is required', 400);

    const [assessmentsCompleted, insightsGenerated, jobsCompared, milestones] = await Promise.all([
      prisma.quizResult.count({ where: { userId } }),
      prisma.insight.count({ where: { userId } }),
      prisma.jDComparison.count({ where: { userId } }),
      prisma.roadmapMilestone.findMany({
        where: { roadmap: { userId } },
        select: { status: true },
      }),
    ]);

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((milestone: { status: string }) => milestone.status === 'COMPLETED').length;
    const inProgressMilestones = milestones.filter((milestone: { status: string }) => milestone.status === 'IN_PROGRESS').length;

    return {
      stats: {
        assessmentsCompleted,
        insightsGenerated,
        jobsCompared,
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          inProgress: inProgressMilestones,
          pending: totalMilestones - completedMilestones - inProgressMilestones,
        },
      },
    };
  },
};
