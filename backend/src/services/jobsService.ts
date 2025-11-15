import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { geminiService } from './geminiService';
import { safeStringify, safeParse } from '@utils/json';
import { assessmentService } from './assessmentService';
import { listLiveJobs, pickAutoScoutJobs, JobMeta } from '@lib/jobsFeed';
import { DomainKey } from '@lib/domainThemes';

const DEFAULT_DOMAIN: DomainKey = 'Technology & Software';
const DOMAIN_SET = new Set<DomainKey>([
  'Technology & Software',
  'Healthcare & Medicine',
  'Business & Finance',
  'Arts & Design',
  'Engineering',
  'Science & Research',
]);

const AUTO_SCOUT_LIMIT = 3;
const AUTO_SCOUT_TTL_MINUTES = 180;

type JDComparisonRow = {
  id: string;
  jobTitle: string;
  company: string | null;
  jobDescription: string;
  matches: string | null;
  gaps: string | null;
  suggestions: string | null;
  fastTrack: string | null;
  summary: string | null;
  source: string;
  jobMeta: string | null;
  createdAt: Date;
};

const isDomainKey = (value?: string | null): value is DomainKey => (value ? DOMAIN_SET.has(value as DomainKey) : false);

const normalizeDomain = (domain?: string | null): DomainKey => {
  if (!domain) return DEFAULT_DOMAIN;
  return isDomainKey(domain) ? (domain as DomainKey) : DEFAULT_DOMAIN;
};

const deriveDomainFromSummary = (summary?: Record<string, any>): DomainKey => {
  const interests = summary?.domainInterests ?? {};
  const ranked = Object.entries(interests)
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
  const top = ranked[0]?.[0];
  if (isDomainKey(top)) return top;
  const fallback = summary?.fieldInterest;
  if (isDomainKey(fallback)) return fallback;
  return DEFAULT_DOMAIN;
};

const mapComparisonRow = (row: JDComparisonRow) => ({
  id: row.id,
  jobTitle: row.jobTitle,
  company: row.company,
  matches: safeParse<string[]>(row.matches, []),
  gaps: safeParse<string[]>(row.gaps, []),
  suggestions: safeParse<string[]>(row.suggestions, []),
  fastTrack: safeParse<string[]>(row.fastTrack, []),
  summary: row.summary ?? '',
  source: row.source,
  jobMeta: safeParse<JobMeta | null>(row.jobMeta, null),
  createdAt: row.createdAt,
});

const loadUserContext = async (userId: string) => {
  try {
    const latest = await assessmentService.getLatestForUser(userId);
    const summary = latest?.quizResult?.summary ?? {};
    const roadmapHighlights = latest?.learning_roadmap?.milestones
      ?.slice(0, 3)
      ?.map((milestone: { title: string }) => milestone.title);

    return {
      summary,
      roadmapHighlights,
      domain: deriveDomainFromSummary(summary),
    };
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      return {
        summary: {},
        roadmapHighlights: [],
        domain: DEFAULT_DOMAIN,
      };
    }
    throw error;
  }
};

const persistComparison = async (
  payload: {
    userId: string;
    jobTitle: string;
    company?: string;
    jobDescription: string;
    source: 'MANUAL' | 'AUTO_SCOUT';
    jobMeta?: JobMeta | null;
  },
  aiResponse: Awaited<ReturnType<typeof geminiService.compareJobDescription>>
) => {
  const record = await prisma.jDComparison.create({
    data: {
      userId: payload.userId,
      jobTitle: payload.jobTitle,
      company: payload.company,
      jobDescription: payload.jobDescription,
      summary: aiResponse.parsed.summary,
      matches: safeStringify(aiResponse.parsed.matches),
      gaps: safeStringify(aiResponse.parsed.gaps),
      suggestions: safeStringify(aiResponse.parsed.suggestions),
      fastTrack: safeStringify(aiResponse.parsed.fastTrackMilestones),
      source: payload.source,
      jobMeta: payload.jobMeta ? safeStringify(payload.jobMeta) : undefined,
    },
  });

  await prisma.insight.create({
    data: {
      userId: payload.userId,
      source: 'GEMINI',
      prompt: aiResponse.prompt,
      response: aiResponse.raw,
      summary:
        payload.source === 'AUTO_SCOUT'
          ? `Auto-scout: ${payload.jobTitle}`
          : `JD comparison for ${payload.jobTitle}`,
      type: payload.source === 'AUTO_SCOUT' ? 'JD_AUTO_SCOUT' : 'JD_COMPARISON',
      metadata: safeStringify({
        source: payload.source,
        jobTitle: payload.jobTitle,
        company: payload.company,
        summary: aiResponse.parsed.summary,
      }),
    },
  });

  return record;
};

const autoScoutIsStale = (rows: JDComparisonRow[]) => {
  if (!rows.length) return true;
  const latest = rows[0]?.createdAt ? new Date(rows[0].createdAt) : null;
  if (!latest) return true;
  const ageMinutes = (Date.now() - latest.getTime()) / 60000;
  return ageMinutes >= AUTO_SCOUT_TTL_MINUTES;
};

export const jobsService = {
  listJobs(domain?: string) {
    return listLiveJobs(normalizeDomain(domain));
  },

  async compareDescription(payload: {
    userId: string;
    jobTitle: string;
    company?: string;
    jobDescription: string;
  }) {
    if (!payload.userId) throw new AppError('userId is required', 400);

    const context = await loadUserContext(payload.userId);
    const aiResponse = await geminiService.compareJobDescription({
      jobTitle: payload.jobTitle,
      company: payload.company,
      jobDescription: payload.jobDescription,
      profile: context.summary,
      roadmapHighlights: context.roadmapHighlights,
    });

    const record = await persistComparison(
      {
        userId: payload.userId,
        jobTitle: payload.jobTitle,
        company: payload.company,
        jobDescription: payload.jobDescription,
        source: 'MANUAL',
      },
      aiResponse
    );

    return {
      record,
      analysis: aiResponse.parsed,
    };
  },

  async listComparisons(userId: string) {
    if (!userId) throw new AppError('userId is required', 400);
    const rows = await prisma.jDComparison.findMany({
      where: { userId, source: 'MANUAL' },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return rows.map(mapComparisonRow);
  },

  async getAutoScoutComparisons(
    userId: string,
    options?: { domain?: string; limit?: number; refresh?: boolean }
  ) {
    if (!userId) throw new AppError('userId is required', 400);

    const limit = Math.min(Math.max(options?.limit ?? AUTO_SCOUT_LIMIT, 1), 5);
    const explicitDomain = normalizeDomain(options?.domain);

    const rows = await prisma.jDComparison.findMany({
      where: { userId, source: 'AUTO_SCOUT' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const normalizedRows = rows.map(mapComparisonRow);
    const shouldRefresh = options?.refresh || rows.length < limit || autoScoutIsStale(rows);

    if (!shouldRefresh) {
      const domainSnapshot = options?.domain
        ? explicitDomain
        : normalizeDomain(normalizedRows[0]?.jobMeta?.domain as string | undefined);
      return {
        domain: domainSnapshot,
        refreshed: false,
        matches: normalizedRows,
      };
    }

    const context = await loadUserContext(userId);
    const domainToUse = options?.domain ? explicitDomain : context.domain;
    const feed = pickAutoScoutJobs(domainToUse, limit);
    const refreshed: JDComparisonRow[] = [];

    for (const job of feed) {
      try {
        const aiResponse = await geminiService.compareJobDescription({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description,
          profile: context.summary,
          roadmapHighlights: context.roadmapHighlights,
        });

        const record = await persistComparison(
          {
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
          },
          aiResponse
        );

        refreshed.push(record as JDComparisonRow);
      } catch (error) {
        console.error('Auto-scout comparison failed', job.id, error);
      }
    }

    const latest = await prisma.jDComparison.findMany({
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
