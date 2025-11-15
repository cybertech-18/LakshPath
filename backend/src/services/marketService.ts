import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import { DOMAIN_THEMES, DomainKey } from '@lib/domainThemes';
import { safeParse, safeStringify } from '@utils/json';

const DEFAULT_DOMAIN: DomainKey = 'Technology & Software';
const SNAPSHOT_WINDOW = 5;
const HISTORY_WINDOW = 12;

const DOMAIN_SNAPSHOT_SEEDS: Record<DomainKey, string[]> = {
  'Technology & Software': [
    'Cloud roles up 12% WoW across Bengaluru hiring feeds.',
    'React 19 mentioned in 850 postings this week.',
    'Cybersecurity analyst salaries increased by 8% QoQ.',
    '65% of unicorns are hiring for platform engineers with AI workloads.',
  ],
  'Healthcare & Medicine': [
    'Telemedicine consult volumes up 18% in Tier-2 cities.',
    'Hospitals offering 15% premium for critical care specialists with AI diagnostics.',
    'Diagnostics labs expanding remote pathology teams.',
  ],
  'Business & Finance': [
    'FP&A automation roles surged 22% MoM in fintech.',
    'VC portfolio ops teams hiring revenue strategists.',
  ],
  'Arts & Design': [
    'AI product teams adding motion designers for assistant handoffs.',
    'E-commerce brands refreshing design systems ahead of festive launches.',
  ],
  Engineering: [
    'EV powertrain suppliers expanding hiring for validation engineers.',
    'Green infrastructure projects issuing 300+ tenders this quarter.',
  ],
  'Science & Research': [
    'Biotech labs adding computational biology fellows.',
    'Climate research grants funding data + field hybrid teams.',
  ],
};

const FALLBACK_BRIEF = {
  title: 'Hiring steady',
  deltaSummary: 'Fallback briefing unavailable. Showing cached numbers.',
  recommendations: [
    'Double down on portfolio storytelling.',
    'Showcase measurable impact in your CV.',
    'Stay sharp with weekly mock interviews.',
  ],
};

const normalizeDomain = (domain?: string): DomainKey => {
  if (!domain) return DEFAULT_DOMAIN;
  return (Object.keys(DOMAIN_THEMES).includes(domain) ? domain : DEFAULT_DOMAIN) as DomainKey;
};

type SnapshotRecord = {
  id: string;
  domain: string;
  payload: string;
  source: string | null;
  metadata: string | null;
  createdAt: Date;
};

type BriefRecord = {
  id: string;
  domain: string;
  title: string;
  deltaSummary: string;
  recommendations: string;
  metadata: string | null;
  createdAt: Date;
};

const ensureSeedSnapshots = async (domain: DomainKey) => {
  const existing = await prisma.marketSnapshot.count({ where: { domain } });
  if (existing > 0) return;
  const seeds = DOMAIN_SNAPSHOT_SEEDS[domain] ?? DOMAIN_SNAPSHOT_SEEDS[DEFAULT_DOMAIN];
  await prisma.marketSnapshot.createMany({
    data: seeds.map((payload, idx) => ({
      domain,
      payload,
      source: 'seed',
      metadata: safeStringify({ seedIndex: idx }),
    })),
  });
};

const fetchSnapshotWindow = async (domain: DomainKey): Promise<SnapshotRecord[]> => {
  await ensureSeedSnapshots(domain);
  return prisma.marketSnapshot.findMany({
    where: { domain },
    orderBy: { createdAt: 'desc' },
    take: SNAPSHOT_WINDOW,
  });
};

const mapBrief = (brief: BriefRecord) => ({
  id: brief.id,
  domain: brief.domain,
  title: brief.title,
  deltaSummary: brief.deltaSummary,
  recommendations: safeParse<string[]>(brief.recommendations, []),
  metadata: safeParse<Record<string, unknown>>(brief.metadata, {}),
  createdAt: brief.createdAt,
});

const summarizeSnapshots = async (domain: DomainKey) => {
  const snapshots = await fetchSnapshotWindow(domain);
  const payloads = snapshots.map((snapshot: SnapshotRecord) => snapshot.payload);

  try {
    const brief = await geminiService.marketBrief({ snapshots: payloads });
    const created = await prisma.marketBrief.create({
      data: {
        domain,
        title: brief.parsed.title,
        deltaSummary: brief.parsed.deltaSummary,
        recommendations: safeStringify(brief.parsed.recommendations ?? []),
  snapshotIds: safeStringify(snapshots.map((snapshot: SnapshotRecord) => snapshot.id)),
        metadata: safeStringify({ snapshotCount: snapshots.length }),
      },
    });
    return mapBrief(created);
  } catch (error) {
    console.error('Market brief generation failed', error);
    return { ...FALLBACK_BRIEF, domain, id: 'fallback', createdAt: new Date(), metadata: {} };
  }
};

export const marketService = {
  async getBrief(domain?: string) {
    const normalized = normalizeDomain(domain);
    const latest = await prisma.marketBrief.findFirst({
      where: { domain: normalized },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      return mapBrief(latest);
    }

    return summarizeSnapshots(normalized);
  },

  async getHistory(domain?: string, limit = HISTORY_WINDOW) {
    const normalized = normalizeDomain(domain);
    const history = await prisma.marketBrief.findMany({
      where: { domain: normalized },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    if (!history.length) {
      const fresh = await summarizeSnapshots(normalized);
      return [fresh];
    }

    return history.map(mapBrief);
  },

  async refreshBrief(domain?: string) {
    const normalized = normalizeDomain(domain);
    return summarizeSnapshots(normalized);
  },
};
