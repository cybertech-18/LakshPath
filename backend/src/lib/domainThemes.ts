export type DomainKey =
  | 'Technology & Software'
  | 'Healthcare & Medicine'
  | 'Business & Finance'
  | 'Arts & Design'
  | 'Engineering'
  | 'Science & Research';

export interface DomainTheme {
  mission: string;
  interestTags: string[];
  skillTags: string[];
  personalityTag: string;
  aiHook: string;
  tone: string;
  nudges: string[];
}

export const DOMAIN_THEMES: Record<DomainKey | 'default', DomainTheme> = {
  'Technology & Software': {
    mission: 'Innovation Sprint',
    interestTags: ['Innovation', 'Problem Solving', 'AI-first'],
    skillTags: ['Programming', 'System Design', 'Product Thinking'],
    personalityTag: 'Systems Thinker',
    aiHook: 'Double down on open-source projects and showcase architecture ownership.',
    tone: 'Sharp, analytical, forward-looking product coach.',
    nudges: [
      'Ship one architecture review or RFC this week.',
      'Log code health stats after each iteration.',
    ],
  },
  'Healthcare & Medicine': {
    mission: 'Patient Impact',
    interestTags: ['Clinical Excellence', 'Patient Care', 'Public Health'],
    skillTags: ['Diagnostics', 'Clinical Research', 'Patient Communication'],
    personalityTag: 'Compassionate Leader',
    aiHook: 'Highlight case notes, evidence-based outcomes, and multidisciplinary collaboration.',
    tone: 'Calm, compassionate, evidence-backed bedside mentor.',
    nudges: [
      'Log telemedicine practice hours and patient outcomes.',
      'Summarize one complex case for your mentor team.',
    ],
  },
  'Business & Finance': {
    mission: 'Strategic Value',
    interestTags: ['Market Analysis', 'Strategy', 'Leadership'],
    skillTags: ['Financial Modeling', 'Stakeholder Management', 'Growth Experiments'],
    personalityTag: 'Strategic Operator',
    aiHook: 'Publish insight briefs and build revenue-backed case studies.',
    tone: 'Boardroom-ready strategist focused on ROI and clarity.',
    nudges: [
      'Ship a one-page revenue experiment brief.',
      'Track stakeholder updates in a weekly ops log.',
    ],
  },
  'Arts & Design': {
    mission: 'Creative Storytelling',
    interestTags: ['Design Systems', 'Visual Craft', 'Storytelling'],
    skillTags: ['Visual Design', 'UX Research', 'Prototyping'],
    personalityTag: 'Experience Curator',
    aiHook: 'Ship iterative design drops and narrate the creative strategy.',
    tone: 'Inspiring creative director with crisp storytelling cues.',
    nudges: [
      'Publish a micro case study showcasing process + impact.',
      'Refresh your inspiration board and tag learnings.',
    ],
  },
  Engineering: {
    mission: 'Real-world Systems',
    interestTags: ['Infrastructure', 'Optimization', 'Sustainability'],
    skillTags: ['CAD', 'Project Planning', 'Quality Systems'],
    personalityTag: 'Resilient Builder',
    aiHook: 'Document simulations, site learnings, and impact metrics for each project.',
    tone: 'Pragmatic engineering mentor focused on rigor and safety.',
    nudges: [
      'Capture field learnings with photos + metrics after each sprint.',
      'Audit one system for reliability gaps this week.',
    ],
  },
  'Science & Research': {
    mission: 'Discovery Mindset',
    interestTags: ['Experiments', 'Data Integrity', 'Peer Review'],
    skillTags: ['Lab Techniques', 'Data Analysis', 'Scientific Writing'],
    personalityTag: 'Evidence Hunter',
    aiHook: 'Publish concise lab updates and highlight reproducible breakthroughs.',
    tone: 'Curious principal investigator obsessed with reproducibility.',
    nudges: [
      'Log experiment variables immediately after each trial.',
      'Draft a summary for peer review or lab meeting.',
    ],
  },
  default: {
    mission: 'Career Growth',
    interestTags: ['Learning', 'Impact', 'Leadership'],
    skillTags: ['Communication', 'Adaptability', 'Execution'],
    personalityTag: 'Growth Mindset',
    aiHook: 'Keep compounding skills through consistent practice and storytelling.',
    tone: 'Supportive generalist coach focused on momentum.',
    nudges: [
      'Share one measurable win with your accountability partner.',
      'Reserve a weekly retrospective slot to note what worked.',
    ],
  },
};
