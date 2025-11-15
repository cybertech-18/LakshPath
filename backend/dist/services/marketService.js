"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geminiService_1 = require("./geminiService");
const domainThemes_1 = require("../lib/domainThemes");
const json_1 = require("../utils/json");
const DEFAULT_DOMAIN = 'Technology & Software';
const SNAPSHOT_WINDOW = 5;
const HISTORY_WINDOW = 12;
const DOMAIN_SNAPSHOT_SEEDS = {
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
const normalizeDomain = (domain) => {
    if (!domain)
        return DEFAULT_DOMAIN;
    return (Object.keys(domainThemes_1.DOMAIN_THEMES).includes(domain) ? domain : DEFAULT_DOMAIN);
};
const ensureSeedSnapshots = async (domain) => {
    const existing = await prisma_1.default.marketSnapshot.count({ where: { domain } });
    if (existing > 0)
        return;
    const seeds = DOMAIN_SNAPSHOT_SEEDS[domain] ?? DOMAIN_SNAPSHOT_SEEDS[DEFAULT_DOMAIN];
    await prisma_1.default.marketSnapshot.createMany({
        data: seeds.map((payload, idx) => ({
            domain,
            payload,
            source: 'seed',
            metadata: (0, json_1.safeStringify)({ seedIndex: idx }),
        })),
    });
};
const fetchSnapshotWindow = async (domain) => {
    await ensureSeedSnapshots(domain);
    return prisma_1.default.marketSnapshot.findMany({
        where: { domain },
        orderBy: { createdAt: 'desc' },
        take: SNAPSHOT_WINDOW,
    });
};
const mapBrief = (brief) => ({
    id: brief.id,
    domain: brief.domain,
    title: brief.title,
    deltaSummary: brief.deltaSummary,
    recommendations: (0, json_1.safeParse)(brief.recommendations, []),
    metadata: (0, json_1.safeParse)(brief.metadata, {}),
    createdAt: brief.createdAt,
});
const summarizeSnapshots = async (domain) => {
    const snapshots = await fetchSnapshotWindow(domain);
    const payloads = snapshots.map((snapshot) => snapshot.payload);
    try {
        const brief = await geminiService_1.geminiService.marketBrief({ snapshots: payloads });
        const created = await prisma_1.default.marketBrief.create({
            data: {
                domain,
                title: brief.parsed.title,
                deltaSummary: brief.parsed.deltaSummary,
                recommendations: (0, json_1.safeStringify)(brief.parsed.recommendations ?? []),
                snapshotIds: (0, json_1.safeStringify)(snapshots.map((snapshot) => snapshot.id)),
                metadata: (0, json_1.safeStringify)({ snapshotCount: snapshots.length }),
            },
        });
        return mapBrief(created);
    }
    catch (error) {
        console.error('Market brief generation failed', error);
        return { ...FALLBACK_BRIEF, domain, id: 'fallback', createdAt: new Date(), metadata: {} };
    }
};
exports.marketService = {
    async getBrief(domain) {
        const normalized = normalizeDomain(domain);
        const latest = await prisma_1.default.marketBrief.findFirst({
            where: { domain: normalized },
            orderBy: { createdAt: 'desc' },
        });
        if (latest) {
            return mapBrief(latest);
        }
        return summarizeSnapshots(normalized);
    },
    async getHistory(domain, limit = HISTORY_WINDOW) {
        const normalized = normalizeDomain(domain);
        const history = await prisma_1.default.marketBrief.findMany({
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
    async refreshBrief(domain) {
        const normalized = normalizeDomain(domain);
        return summarizeSnapshots(normalized);
    },
};
