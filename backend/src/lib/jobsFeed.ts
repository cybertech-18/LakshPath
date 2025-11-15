import { DomainKey } from './domainThemes';

export interface LiveJob {
  id: string;
  domain: DomainKey;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  tags: string[];
  description: string;
  jobUrl?: string;
  postedAgo?: string;
  signals?: string[];
}

const LIVE_JOB_FEED: LiveJob[] = [
  {
    id: 'tech-arch-ai-fullstack',
    domain: 'Technology & Software',
    title: 'Full-Stack Engineer (AI Platform)',
    company: 'Aurora Systems',
    location: 'Remote • Bengaluru HQ',
    salary: '₹15-24 LPA',
    type: 'Full Time',
    experience: '3-5 years',
    tags: ['React 19', 'Node.js', 'LLM Ops', 'GCP'],
    description:
      'Lead the build-out of internal AI agent tooling powering 200+ product pods. Own streaming React 19 interfaces, Node-based orchestrators, and prompt evaluation pipelines. Expected to ship RFCs every sprint and pair with design on feedback loops.',
    postedAgo: '3h ago',
    jobUrl: 'https://jobs.aurorasystems.ai/fullstack-ai',
    signals: ['React 19 launch partner', 'Internal AI charter'],
  },
  {
    id: 'tech-sec-staff',
    domain: 'Technology & Software',
    title: 'Staff Security Engineer (AI Safety)',
    company: 'Nimbus Security Cloud',
    location: 'Hyderabad',
    salary: '₹22-32 LPA',
    type: 'Hybrid',
    experience: '6+ years',
    tags: ['Threat Modeling', 'Security Reviews', 'Python', 'Kubernetes'],
    description:
      'Design and enforce secure-by-default guardrails for AI copilots used by BFSI clients. Lead threat modeling sessions, run red-team drills, and coach squads on secrets handling + observability hygiene.',
    postedAgo: '1d ago',
    jobUrl: 'https://nimbussecurity.in/careers/staff-security',
    signals: ['BFSI focus', 'Zero trust transformation'],
  },
  {
    id: 'health-telemed-lead',
    domain: 'Healthcare & Medicine',
    title: 'Telemedicine Program Lead',
    company: 'PranaCare Hospitals',
    location: 'Delhi NCR',
    salary: '₹18-26 LPA',
    type: 'Full Time',
    experience: '5+ years',
    tags: ['Telemedicine', 'Clinical Ops', 'Patient Experience'],
    description:
      'Scale a 200-bed telemedicine program focused on chronic care. Coordinate virtual rounds, ensure evidence-based protocols, and train clinicians on remote diagnostics + AI-enabled triage stacks.',
    postedAgo: '6h ago',
    jobUrl: 'https://careers.pranacare.in/telemedicine-lead',
    signals: ['Chronic care boost', 'AI triage adoption'],
  },
  {
    id: 'health-clinical-analyst',
    domain: 'Healthcare & Medicine',
    title: 'Clinical Data Analyst (Remote Diagnostics)',
    company: 'PulseIQ Labs',
    location: 'Remote',
    salary: '₹12-18 LPA',
    type: 'Full Time',
    experience: '3-4 years',
    tags: ['R', 'Python', 'Clinical Analytics', 'Regulatory'],
    description:
      'Partner with clinicians to translate device data into actionable care plans. Build clean datasets, author regulatory-grade evidence summaries, and automate anomaly detection dashboards.',
    postedAgo: '1d ago',
    signals: ['Device + AI fusion', 'Global regulatory exposure'],
  },
  {
    id: 'biz-fpa-genai',
    domain: 'Business & Finance',
    title: 'FP&A Analyst (GenAI Automation)',
    company: 'Northwind Capital',
    location: 'Mumbai',
    salary: '₹14-20 LPA',
    type: 'Full Time',
    experience: '3-5 years',
    tags: ['FP&A', 'Looker', 'GenAI', 'Stakeholder Management'],
    description:
      'Wire LLM copilots into forecasting workflows. Build scenario models, narrate board-ready updates, and partner with revenue squads to automate reconciliations.',
    postedAgo: '4h ago',
    signals: ['Board exposure', 'Automation charter'],
  },
  {
    id: 'biz-growth-strategist',
    domain: 'Business & Finance',
    title: 'Growth Strategy Lead (Marketplace)',
    company: 'Vyasa Commerce',
    location: 'Bengaluru',
    salary: '₹18-28 LPA',
    type: 'Hybrid',
    experience: '5-7 years',
    tags: ['Strategy', 'Marketplaces', 'PLG', 'Leadership'],
    description:
      'Own growth playbooks for a fast-scaling marketplace. Blend cohort analytics, founder-level stakeholder management, and no-code automation to unlock 3x GMV in 12 months.',
    postedAgo: '2d ago',
    signals: ['Marketplace blitz', 'Direct to CEO exposure'],
  },
  {
    id: 'design-motion-lead',
    domain: 'Arts & Design',
    title: 'Motion Systems Lead (AI Assistants)',
    company: 'Echo Studio',
    location: 'Remote • Goa Studio',
    salary: '₹10-16 LPA',
    type: 'Contract-to-Hire',
    experience: '4+ years',
    tags: ['Motion', '3D', 'Figma', 'Prototyping'],
    description:
      'Design motion languages for AI assistant handoffs across mobile + web. Partner with engineering on Lottie/Canvas integrations and narrate the intent behind each motion study.',
    postedAgo: '8h ago',
    jobUrl: 'https://echo.studio/hiring/motion',
    signals: ['AI interface lab', 'Direct PMF impact'],
  },
  {
    id: 'design-ux-lead',
    domain: 'Arts & Design',
    title: 'Lead Product Designer (Commerce)',
    company: 'NovaKart',
    location: 'Bengaluru',
    salary: '₹16-24 LPA',
    type: 'Full Time',
    experience: '5-7 years',
    tags: ['Design Systems', 'Consumer Apps', 'Storytelling'],
    description:
      'Ship omni-channel commerce flows with emphasis on quantified storytelling. Run research sprints, maintain design systems, and coach junior designers.',
    postedAgo: '3d ago',
  },
  {
    id: 'eng-ev-validation',
    domain: 'Engineering',
    title: 'EV Powertrain Validation Engineer',
    company: 'Volt Mobility',
    location: 'Pune',
    salary: '₹12-18 LPA',
    type: 'On-site',
    experience: '4+ years',
    tags: ['Powertrain', 'Thermal', 'CAN', 'Validation'],
    description:
      'Run integrated validation cycles for EV drivetrains. Coordinate lab + track tests, log telemetry, and close the loop with design to boost efficiency metrics.',
    postedAgo: '9h ago',
    signals: ['EV scale up', 'Cross-discipline pods'],
  },
  {
    id: 'eng-green-project',
    domain: 'Engineering',
    title: 'Sustainability Project Engineer',
    company: 'Praana Infra',
    location: 'Chennai',
    salary: '₹14-22 LPA',
    type: 'Full Time',
    experience: '5+ years',
    tags: ['Project Management', 'Green Buildings', 'Quality'],
    description:
      'Deliver LEED platinum retrofits across metro campuses. Own vendor orchestration, site QA, and weekly impact dashboards for CXOs.',
    postedAgo: '2d ago',
  },
  {
    id: 'science-comp-bio',
    domain: 'Science & Research',
    title: 'Computational Biologist (Climate)',
    company: 'Gaia Labs',
    location: 'Bengaluru',
    salary: '₹13-19 LPA',
    type: 'Hybrid',
    experience: '3-6 years',
    tags: ['Python', 'Bioinformatics', 'Climate'],
    description:
      'Model crop resiliency data sets, stitch satellite feeds, and collaborate with agronomists to publish breakthroughs quarterly.',
    postedAgo: '5h ago',
    signals: ['Climate grants', 'Global consortium'],
  },
  {
    id: 'science-lab-manager',
    domain: 'Science & Research',
    title: 'Lab Program Manager (AI Discovery)',
    company: 'Helix Research',
    location: 'Hyderabad',
    salary: '₹17-25 LPA',
    type: 'Full Time',
    experience: '6+ years',
    tags: ['Lab Ops', 'Documentation', 'AI Tools'],
    description:
      'Operationalize AI-assisted discovery workflows across 3 labs. Stand up SOPs, manage compliance, and publish reproducibility reports.',
    postedAgo: '3d ago',
  },
];

const byDomain = (domain: DomainKey, limit: number) => {
  const prioritized = LIVE_JOB_FEED.filter((job) => job.domain === domain);
  const fallback = LIVE_JOB_FEED.filter((job) => job.domain !== domain);
  return [...prioritized, ...fallback].slice(0, limit);
};

export const listLiveJobs = (domain: DomainKey, limit = 5) => byDomain(domain, limit).map(({ description, ...rest }) => rest);

export const pickAutoScoutJobs = (domain: DomainKey, limit = 3) => byDomain(domain, limit);

export type JobMeta = ReturnType<typeof listLiveJobs>[number] & {
  postedAgo?: string;
  signals?: string[];
};
