export interface UserProfileSummary {
  name?: string;
  education?: string;
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  preferredWorkStyle?: string;
  motivation?: string;
  targetSalary?: string;
  skillRatings?: Record<string, number>;
}

export interface CareerExplanationRequest {
  profile: UserProfileSummary;
  quizInsights: Record<string, unknown>;
  topCareers: Array<{
    title: string;
    matchScore: number;
    description?: string;
    keySkills?: string[];
  }>;
}

export interface CareerExplanationResponse {
  careers: Array<{
    title: string;
    whyItFits: string;
    strengths: string[];
    weaknesses: string[];
    personalizedAdvice: string;
  }>;
}

export interface RoadmapRequest {
  careerTitle: string;
  seniority: 'beginner' | 'intermediate' | 'advanced';
  durationMonths?: number;
  profile: UserProfileSummary;
}

export interface RoadmapResponse {
  headline: string;
  months: Array<{
    month: number;
    theme: string;
    skills: string[];
    resources: string[];
    project: string;
  }>;
}

export interface GoalSuccessCriteriaRequest {
  milestoneTitle: string;
  durationWeeks: number;
  profile: UserProfileSummary;
}

export interface GoalSuccessCriteriaResponse {
  successCriteria: string;
  weeklyNudges: string[];
}

export interface JDComparatorRequest {
  jobTitle: string;
  company?: string;
  jobDescription: string;
  profile: UserProfileSummary;
  roadmapHighlights?: string[];
}

export interface JDComparatorResponse {
  summary: string;
  matches: string[];
  gaps: string[];
  fastTrackMilestones: string[];
  suggestions: string[];
}

export interface SkillMicroTaskRequest {
  weakSkills: Array<{ name: string; score: number }>;
}

export interface SkillMicroTaskResponse {
  heatmap: Array<{ name: string; score: number; sentiment: string }>;
  microTasks: Array<{
    skill: string;
    title: string;
    description: string;
    resourceUrl: string;
  }>;
}

export interface MentorChatRequest {
  round: 'career' | 'interview' | 'scholarship';
  message: string;
  context: UserProfileSummary & {
    currentCareerGoal?: string;
    recentMilestones?: string[];
    jdHighlights?: string[];
    domainFocus?: string;
    domainTheme?: {
      mission: string;
      personalityTag: string;
      aiHook: string;
      tone: string;
    };
    domainInterests?: Record<string, number>;
    recentInsights?: string[];
    assessmentSummary?: Record<string, unknown>;
  };
}

export interface MentorActionStep {
  title: string;
  detail: string;
  impact?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface MentorFollowUp {
  question: string;
  why: string;
}

export interface MentorChatResponse {
  headline: string;
  summary: string;
  actionPlan: MentorActionStep[];
  followUps: MentorFollowUp[];
  nudges: string[];
  confidence: number;
  references?: string[];
  tone?: string;
}

export interface MarketBriefResponse {
  title: string;
  deltaSummary: string;
  recommendations: string[];
}
