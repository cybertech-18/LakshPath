import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { safeParse, safeStringify } from '@utils/json';
import { geminiService } from './geminiService';
import { DOMAIN_THEMES, DomainKey } from '@lib/domainThemes';
import { notificationService } from './notificationService';

const DEFAULT_DOMAIN: DomainKey = 'Technology & Software';

const parseDurationWeeks = (duration?: string | null) => {
  if (!duration) return 4;
  const value = Number(duration.match(/\d+/)?.[0] ?? 4);
  if (duration.toLowerCase().includes('month')) {
    return value * 4;
  }
  return value;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatGoalContract = (contract: {
  id: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  successCriteria: string;
  startDate: Date;
  endDate: Date;
  status: string;
  nudges: string | null;
}) => ({
  id: contract.id,
  milestoneId: contract.milestoneId,
  title: contract.title,
  description: contract.description,
  successCriteria: contract.successCriteria,
  startDate: contract.startDate,
  endDate: contract.endDate,
  status: contract.status,
  nudges: safeParse<string[]>(contract.nudges, []),
});

const resolveDomainTheme = (summary: Record<string, unknown>) => {
  const domainFocus = (summary?.fieldInterest as string) || DEFAULT_DOMAIN;
  const theme = DOMAIN_THEMES[domainFocus as DomainKey] || DOMAIN_THEMES.default;
  return { domainFocus, theme };
};

const ensureGoalForNextMilestone = async (
  completedMilestone: any,
  summary: Record<string, unknown>,
  strengths: string[] = [],
  weaknesses: string[] = []
) => {
  const nextMilestone = await prisma.roadmapMilestone.findFirst({
    where: {
      roadmapId: completedMilestone.roadmapId,
      position: { gt: completedMilestone.position },
    },
    orderBy: { position: 'asc' },
  });

  if (!nextMilestone) return null;

  const existing = await prisma.goalContract.findUnique({ where: { milestoneId: nextMilestone.id } });
  if (existing) {
    return existing;
  }

  const { domainFocus, theme } = resolveDomainTheme(summary);

  let aiGoal: Awaited<ReturnType<typeof geminiService.goalSuccessCriteria>> | null = null;
  const profile = {
    name: completedMilestone.roadmap.user.name ?? undefined,
    education: (summary?.educationLevel as string) ?? undefined,
    strengths,
    weaknesses,
    preferredWorkStyle: (summary?.workStyle as string) ?? undefined,
    motivation: (summary?.motivation as string) ?? undefined,
    targetSalary: (summary?.salaryExpectation as string) ?? undefined,
  };

  try {
    aiGoal = await geminiService.goalSuccessCriteria({
      milestoneTitle: nextMilestone.title,
      durationWeeks: parseDurationWeeks(nextMilestone.duration),
      profile,
    });
  } catch (error) {
    console.error('Goal automation failed, falling back to defaults', error);
  }

  const nudgePool = new Set<string>();
  (aiGoal?.parsed.weeklyNudges ?? []).forEach((nudge) => nudge && nudgePool.add(nudge));
  if (theme.aiHook) nudgePool.add(theme.aiHook);
  theme.nudges.forEach((nudge) => nudge && nudgePool.add(nudge));

  const nudgeList = Array.from(nudgePool).slice(0, 5);
  const successCriteria = aiGoal?.parsed.successCriteria ?? `Complete ${nextMilestone.title} with measurable outputs.`;

  const goalContract = await prisma.goalContract.create({
    data: {
      userId: completedMilestone.roadmap.userId,
      milestoneId: nextMilestone.id,
      title: nextMilestone.title,
      description: nextMilestone.description,
      startDate: new Date(),
      endDate: addDays(new Date(), parseDurationWeeks(nextMilestone.duration) * 7),
      successCriteria,
      nudges: safeStringify(nudgeList),
      status: 'ACTIVE',
    },
  });

  if (aiGoal) {
    await prisma.insight.create({
      data: {
        userId: completedMilestone.roadmap.userId,
        source: 'GEMINI',
        prompt: aiGoal.prompt,
        response: aiGoal.raw,
        summary: `SMART goal created for ${nextMilestone.title}`,
        type: 'GOAL_CONTRACT',
        metadata: safeStringify({
          nudges: nudgeList,
          domainFocus,
          mission: theme.mission,
        }),
      },
    });
  }

  await notificationService.sendGoalContractNotification({
    user: {
      id: completedMilestone.roadmap.user.id,
      name: completedMilestone.roadmap.user.name,
      email: completedMilestone.roadmap.user.email,
    },
    goal: {
      title: goalContract.title,
      successCriteria: goalContract.successCriteria,
      nudges: nudgeList,
      startDate: goalContract.startDate,
      endDate: goalContract.endDate,
    },
    tone: theme.tone,
  });

  return goalContract;
};

export const roadmapService = {
  async getActiveRoadmap(userId: string) {
    if (!userId) throw new AppError('userId is required', 400);

    const roadmap = await prisma.learningRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { milestones: true },
    });

    if (!roadmap) {
      throw new AppError('No roadmap found', 404);
    }

    return {
      id: roadmap.id,
      title: roadmap.title,
      duration: roadmap.duration,
      summary: roadmap.summary,
      ai_plan: safeParse(roadmap.aiPlan, null),
      milestones: roadmap.milestones
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        .map((milestone: {
          id: string;
          title: string;
          description: string;
          duration: string | null;
          status: string;
          resources: string | null;
          position: number;
        }) => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          duration: milestone.duration,
          status: milestone.status,
          resources: safeParse(milestone.resources, []),
          position: milestone.position,
        })),
    };
  },

  async updateMilestoneStatus(milestoneId: string, status: string) {
    if (!milestoneId) throw new AppError('milestoneId is required', 400);

    const milestone = await prisma.roadmapMilestone.update({
      where: { id: milestoneId },
      data: { status },
      include: {
        roadmap: {
          include: {
            user: true,
            quizResult: true,
          },
        },
      },
    });

    const summary = safeParse<Record<string, unknown>>(milestone.roadmap.quizResult?.summary, {});
    const strengths = safeParse<string[]>(milestone.roadmap.quizResult?.strengths, []);
    const weaknesses = safeParse<string[]>(milestone.roadmap.quizResult?.weaknesses, []);

    let nextGoalContract = null;
    if (status === 'COMPLETED') {
      nextGoalContract = await ensureGoalForNextMilestone(milestone, summary, strengths, weaknesses);
    }

    return {
      milestone: {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        duration: milestone.duration,
        status: milestone.status,
        position: milestone.position,
        updatedAt: milestone.updatedAt,
      },
      goalContract: nextGoalContract ? formatGoalContract(nextGoalContract) : null,
    };
  },
};
