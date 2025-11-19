import { useState, useEffect, useRef, useMemo, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Target, TrendingUp, BookOpen, Briefcase, Award, 
  CheckCircle, Clock, LogOut, LayoutDashboard, MapPin,
  Star, Calendar, MessageCircle, Zap, Trophy, Users,
  Brain, Sparkles, ArrowRight, Activity, Layers, Download,
  Share2, Bell, X, AlertCircle, Filter, Search, Heart,
  Phone, MapPinned, TrendingDown, Linkedin, FileText,
  ArrowUpRight, Gauge, UserPlus, Loader2, Send, RefreshCcw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { assessmentAPI, chatAPI, marketAPI, jobsAPI, insightsAPI, userAPI } from '../services/api';
import type { MentorChatResponse, UserProfileResponse, UserProgressResponse } from '../services/api';

interface CareerMatch {
  title: string;
  match_score: number;
  description: string;
  avg_salary: string;
  growth_rate: string;
  key_skills: string[];
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'pending';
  resources: Array<{
    title: string;
    platform: string;
    link: string;
  }>;
}

interface MarketBrief {
  title: string;
  deltaSummary: string;
  recommendations: string[];
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  tags: string[];
  domain: DomainKey;
  jobUrl?: string;
  postedAgo?: string;
  signals?: string[];
}

interface AutoScoutJobMeta {
  id: string;
  domain: DomainKey;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  tags: string[];
  jobUrl?: string;
  postedAgo?: string;
  signals?: string[];
}

interface AutoScoutMatch {
  id: string;
  jobTitle: string;
  company: string | null;
  summary: string;
  matches: string[];
  gaps: string[];
  suggestions: string[];
  fastTrack: string[];
  jobMeta?: AutoScoutJobMeta | null;
  createdAt: string;
}

interface JobComparison {
  id: string;
  jobTitle: string;
  company: string | null;
  matches: string[];
  gaps: string[];
  suggestions: string[];
  fastTrack: string[];
  summary?: string;
  source?: string;
  jobMeta?: AutoScoutJobMeta | null;
  createdAt: string;
}

interface InsightRow {
  id: string;
  summary: string;
  type: string;
  createdAt: string;
  prompt: string;
  metadata: Record<string, unknown>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  createdAt: string;
  structured?: MentorChatResponse;
}

interface MicroCoachHeatmap {
  name: string;
  score: number;
  sentiment: string;
}

interface MicroCoachTask {
  skill: string;
  title: string;
  description: string;
  resourceUrl: string;
}

interface MicroCoachPayload {
  quizResultId?: string;
  weakSkills: Array<{ name: string; score: number }>;
  heatmap: MicroCoachHeatmap[];
  microTasks: MicroCoachTask[];
  insightId?: string;
  generatedAt?: string;
}

type UserProfileStats = UserProgressResponse['stats'];

type DomainKey =
  | 'Technology & Software'
  | 'Healthcare & Medicine'
  | 'Business & Finance'
  | 'Arts & Design'
  | 'Engineering'
  | 'Science & Research';

interface DomainTheme {
  mission: string;
  interestTags: string[];
  skillTags: string[];
  personalityTag: string;
  aiHook: string;
  skillHeadline: string;
}

const DOMAIN_THEMES: Record<DomainKey | 'default', DomainTheme> = {
  'Technology & Software': {
    mission: 'Innovation Sprint',
    interestTags: ['Innovation', 'Problem Solving', 'AI-first'],
    skillTags: ['Programming', 'System Design', 'Product Thinking'],
    personalityTag: 'Systems Thinker',
    aiHook: 'Double down on open-source projects and showcase architecture ownership.',
    skillHeadline: 'TECHNICAL SKILLS',
  },
  'Healthcare & Medicine': {
    mission: 'Patient Impact',
    interestTags: ['Clinical Excellence', 'Patient Care', 'Public Health'],
    skillTags: ['Diagnostics', 'Clinical Research', 'Patient Communication'],
    personalityTag: 'Compassionate Leader',
    aiHook: 'Highlight case notes, evidence-based outcomes, and multidisciplinary collaboration.',
    skillHeadline: 'CLINICAL SKILLS',
  },
  'Business & Finance': {
    mission: 'Strategic Value',
    interestTags: ['Market Analysis', 'Strategy', 'Leadership'],
    skillTags: ['Financial Modeling', 'Stakeholder Management', 'Growth Experiments'],
    personalityTag: 'Strategic Operator',
    aiHook: 'Publish insight briefs and build revenue-backed case studies.',
    skillHeadline: 'BUSINESS SKILLS',
  },
  'Arts & Design': {
    mission: 'Creative Storytelling',
    interestTags: ['Design Systems', 'Visual Craft', 'Storytelling'],
    skillTags: ['Visual Design', 'UX Research', 'Prototyping'],
    personalityTag: 'Experience Curator',
    aiHook: 'Ship iterative design drops and narrate the creative strategy.',
    skillHeadline: 'CREATIVE SKILLS',
  },
  Engineering: {
    mission: 'Real-world Systems',
    interestTags: ['Infrastructure', 'Optimization', 'Sustainability'],
    skillTags: ['CAD', 'Project Planning', 'Quality Systems'],
    personalityTag: 'Resilient Builder',
    aiHook: 'Document simulations, site learnings, and impact metrics for each project.',
    skillHeadline: 'ENGINEERING SKILLS',
  },
  'Science & Research': {
    mission: 'Discovery Mindset',
    interestTags: ['Experiments', 'Data Integrity', 'Peer Review'],
    skillTags: ['Lab Techniques', 'Data Analysis', 'Scientific Writing'],
    personalityTag: 'Evidence Hunter',
    aiHook: 'Publish concise lab updates and highlight reproducible breakthroughs.',
    skillHeadline: 'RESEARCH SKILLS',
  },
  default: {
    mission: 'Career Growth',
    interestTags: ['Learning', 'Impact', 'Leadership'],
    skillTags: ['Communication', 'Adaptability', 'Execution'],
    personalityTag: 'Growth Mindset',
    aiHook: 'Keep compounding skills through consistent practice and storytelling.',
    skillHeadline: 'CORE SKILLS',
  },
};

const DOMAIN_KEY_LIST = Object.keys(DOMAIN_THEMES).filter((key) => key !== 'default') as DomainKey[];

const ensureDomainValue = (value?: string | null): DomainKey =>
  DOMAIN_KEY_LIST.includes(value as DomainKey) ? (value as DomainKey) : 'Technology & Software';

interface DomainMarketBlueprint {
  salaryRoleLabel: string;
  salaryTrends: Array<{ label: string; range: string; change: string }>;
  salaryInsight: string;
  trendingSkill: {
    headline: string;
    description: string;
    ctaLabel: string;
    actionToast: string;
    learnMoreUrl: string;
  };
  hiringHighlights: {
    highDemand: { roles: string[]; trend: string };
    stable: { roles: string[]; trend: string };
    declining: { roles: string[]; trend: string };
  };
}

const DOMAIN_MARKET_BLUEPRINTS: Record<DomainKey | 'default', DomainMarketBlueprint> = {
  'Technology & Software': {
    salaryRoleLabel: 'Software Engineer',
    salaryTrends: [
      { label: 'Entry Level (0-2 yrs)', range: '₹4-8 LPA', change: '↑ 12% vs 2024' },
      { label: 'Mid Level (3-5 yrs)', range: '₹8-15 LPA', change: '↑ 18% vs 2024' },
      { label: 'Senior Level (5+ yrs)', range: '₹15-30 LPA', change: '↑ 22% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: Remote product pods are paying 20-30% higher packages for full-stack owners.',
    trendingSkill: {
      headline: 'React 19 + Server Actions are spiking!',
      description: '850+ job postings mention React 19 with streaming server components this week.',
      ctaLabel: 'ADD TO LEARNING PATH',
      actionToast: 'React 19 sprint pinned to your roadmap!',
      learnMoreUrl: 'https://react.dev/blog',
    },
    hiringHighlights: {
      highDemand: { roles: ['Full-Stack Engineering', 'AI Product Pods'], trend: '+45% jobs' },
      stable: { roles: ['Data Science', 'Product Management'], trend: '+22% jobs' },
      declining: { roles: ['Manual QA', 'Legacy Maintenance'], trend: '-18% jobs' },
    },
  },
  'Healthcare & Medicine': {
    salaryRoleLabel: 'Clinical Specialist',
    salaryTrends: [
      { label: 'Residency (0-2 yrs)', range: '₹5-9 LPA', change: '↑ 10% vs 2024' },
      { label: 'Junior Consultant (3-5 yrs)', range: '₹10-18 LPA', change: '↑ 14% vs 2024' },
      { label: 'Senior Specialist (5+ yrs)', range: '₹18-32 LPA', change: '↑ 20% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: Telemedicine-enabled specialists command ~18% premium in metro hospitals.',
    trendingSkill: {
      headline: 'Telemedicine diagnostics playbooks',
      description: '600+ hospitals need doctors fluent in remote triage, e-prescriptions, and compliance.',
      ctaLabel: 'ADD TO CLINICAL PLAN',
      actionToast: 'Telemedicine practice block added to your plan!',
      learnMoreUrl: 'https://www.who.int/teams/digital-health-and-innovation',
    },
    hiringHighlights: {
      highDemand: { roles: ['Telemedicine Lead', 'Clinical Data Analyst'], trend: '+38% roles' },
      stable: { roles: ['Public Health Programs', 'Hospital Administration'], trend: '+18% roles' },
      declining: { roles: ['Paper-based OPD', 'Manual record keeping'], trend: '-12% roles' },
    },
  },
  'Business & Finance': {
    salaryRoleLabel: 'Strategy & Finance Leader',
    salaryTrends: [
      { label: 'Analyst (0-2 yrs)', range: '₹6-10 LPA', change: '↑ 11% vs 2024' },
      { label: 'Manager (3-5 yrs)', range: '₹12-20 LPA', change: '↑ 15% vs 2024' },
      { label: 'VP / Lead (5+ yrs)', range: '₹22-40 LPA', change: '↑ 19% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: GenAI-native FP&A teams offer retention bonuses for automation talent.',
    trendingSkill: {
      headline: 'GenAI copilots for finance stacks',
      description: '1,200+ CFO orgs seek analysts who can wire LLMs into FP&A and investor workflows.',
      ctaLabel: 'ADD AI FINANCE LAB',
      actionToast: 'GenAI finance lab bookmarked in your tasks!',
      learnMoreUrl: 'https://openai.com/blog/introducing-gpt-4o-mini',
    },
    hiringHighlights: {
      highDemand: { roles: ['FP&A Automation', 'Growth Strategy'], trend: '+34% roles' },
      stable: { roles: ['Equity Research', 'Risk & Compliance'], trend: '+16% roles' },
      declining: { roles: ['Manual Bookkeeping', 'Pure Data Entry'], trend: '-20% roles' },
    },
  },
  'Arts & Design': {
    salaryRoleLabel: 'Product Experience Designer',
    salaryTrends: [
      { label: 'Junior (0-2 yrs)', range: '₹4-7 LPA', change: '↑ 9% vs 2024' },
      { label: 'Mid (3-5 yrs)', range: '₹8-14 LPA', change: '↑ 13% vs 2024' },
      { label: 'Lead (5+ yrs)', range: '₹15-26 LPA', change: '↑ 17% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: Motion + 3D skills add ~22% uplift for design leads in AI product teams.',
    trendingSkill: {
      headline: 'Motion systems for AI-first products',
      description: 'Top consumer apps want designers who choreograph AI feedback with motion cues.',
      ctaLabel: 'ADD MOTION SYSTEMS',
      actionToast: 'Motion design sprint queued up!',
      learnMoreUrl: 'https://webflow.com/blog/motion-design',
    },
    hiringHighlights: {
      highDemand: { roles: ['Product Design Systems', 'Creative Technologists'], trend: '+29% roles' },
      stable: { roles: ['Brand Design', 'UX Research'], trend: '+12% roles' },
      declining: { roles: ['Pure Graphic Ops', 'Static Print'], trend: '-15% roles' },
    },
  },
  Engineering: {
    salaryRoleLabel: 'Systems Engineer',
    salaryTrends: [
      { label: 'Graduate Engineer (0-2 yrs)', range: '₹5-8 LPA', change: '↑ 8% vs 2024' },
      { label: 'Project Engineer (3-5 yrs)', range: '₹9-16 LPA', change: '↑ 12% vs 2024' },
      { label: 'Principal Engineer (5+ yrs)', range: '₹18-30 LPA', change: '↑ 18% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: EV & sustainability projects offer retention bonuses for cross-discipline engineers.',
    trendingSkill: {
      headline: 'EV powertrain & battery validation',
      description: '700+ OEM postings flag need for engineers who link CAD, thermal runs, and plant trials.',
      ctaLabel: 'PIN EV POWERTRAIN LAB',
      actionToast: 'EV powertrain lab added to your milestones!',
      learnMoreUrl: 'https://www.ieee.org/ev',
    },
    hiringHighlights: {
      highDemand: { roles: ['EV Systems', 'Sustainability Projects'], trend: '+31% roles' },
      stable: { roles: ['Industrial Automation', 'Quality Systems'], trend: '+14% roles' },
      declining: { roles: ['Pure Drafting', 'Legacy Plant Maintenance'], trend: '-11% roles' },
    },
  },
  'Science & Research': {
    salaryRoleLabel: 'Research Scientist',
    salaryTrends: [
      { label: 'Junior Researcher (0-2 yrs)', range: '₹4-7 LPA', change: '↑ 7% vs 2024' },
      { label: 'Research Associate (3-5 yrs)', range: '₹8-13 LPA', change: '↑ 11% vs 2024' },
      { label: 'Principal Investigator (5+ yrs)', range: '₹15-28 LPA', change: '↑ 16% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: Labs that publish GenAI-assisted papers fund 2x more fellowships.',
    trendingSkill: {
      headline: 'AI-assisted discovery workflows',
      description: 'Pharma & biotech labs seek scientists fluent in LLM-based literature + experiment planning.',
      ctaLabel: 'ADD DISCOVERY STACK',
      actionToast: 'AI discovery workflow saved to your stack!',
      learnMoreUrl: 'https://www.nature.com/collections/ai-drug-discovery',
    },
    hiringHighlights: {
      highDemand: { roles: ['Computational Biology', 'Climate Research'], trend: '+27% roles' },
      stable: { roles: ['Academic Labs', 'Regulatory Affairs'], trend: '+10% roles' },
      declining: { roles: ['Manual Wet Lab Only', 'Paper-based Reporting'], trend: '-9% roles' },
    },
  },
  default: {
    salaryRoleLabel: 'Career Professional',
    salaryTrends: [
      { label: 'Entry Level', range: '₹4-7 LPA', change: '↑ 8% vs 2024' },
      { label: 'Mid Level', range: '₹8-14 LPA', change: '↑ 12% vs 2024' },
      { label: 'Senior Level', range: '₹15-25 LPA', change: '↑ 16% vs 2024' },
    ],
    salaryInsight: 'INSIGHT: Story-driven portfolios continue to yield ~15% comp lift across domains.',
    trendingSkill: {
      headline: 'Story-driven portfolio drops',
      description: 'Hiring teams reward professionals who publish quantified wins every sprint.',
      ctaLabel: 'PLAN PORTFOLIO DROP',
      actionToast: 'Portfolio storytelling block queued up!',
      learnMoreUrl: 'https://lakshpath.ai/blog',
    },
    hiringHighlights: {
      highDemand: { roles: ['Product Thinking', 'Automation'], trend: '+25% roles' },
      stable: { roles: ['Program Management', 'Customer Success'], trend: '+12% roles' },
      declining: { roles: ['Manual Ops', 'Pure Support'], trend: '-10% roles' },
    },
  },
};

const DashboardNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [marketBrief, setMarketBrief] = useState<MarketBrief | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobComparisons, setJobComparisons] = useState<JobComparison[]>([]);
  const [autoScoutMatches, setAutoScoutMatches] = useState<AutoScoutMatch[]>([]);
  const [autoScoutDomain, setAutoScoutDomain] = useState<DomainKey>('Technology & Software');
  const [isAutoScoutRefreshing, setIsAutoScoutRefreshing] = useState(false);
  const [jobCompareForm, setJobCompareForm] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
  });
  const [isComparingJob, setIsComparingJob] = useState(false);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'mentor-welcome',
      role: 'mentor',
      content: 'Hi there! I am your AI mentor. Ask me anything about your roadmap or upcoming roles.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState(false);
  const [microCoach, setMicroCoach] = useState<MicroCoachPayload | null>(null);
  const [isMicroCoachLoading, setIsMicroCoachLoading] = useState(false);
  const [microCoachError, setMicroCoachError] = useState<string | null>(null);
  const [microCoachRefreshKey, setMicroCoachRefreshKey] = useState(0);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [profileStats, setProfileStats] = useState<UserProfileStats | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: localStorage.getItem('userName') || '',
    avatarUrl: '',
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const hasAuthToken = Boolean(authToken);
  const profileAvatarInitial = useMemo(() => {
    const initial = profileForm.name?.trim()?.charAt(0) || 'U';
    return initial.toUpperCase();
  }, [profileForm.name]);

  const profileDisplayName = useMemo(() => {
    const stored = localStorage.getItem('userName');
    return profileForm.name?.trim() || stored || 'User';
  }, [profileForm.name]);

  const isDemoUser = userId === 'demo-user';

  const profileDirty = useMemo(() => {
    if (!profileData) {
      return Boolean(profileForm.name.trim() || profileForm.avatarUrl.trim());
    }
    const currentName = profileData.profile?.name ?? '';
    const currentAvatar = profileData.profile?.avatarUrl ?? '';
    return (
      profileForm.name.trim() !== currentName.trim() ||
      profileForm.avatarUrl.trim() !== (currentAvatar ?? '').trim()
    );
  }, [profileData, profileForm]);

  const refreshProfileData = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (!userId) {
        setProfileData(null);
        setProfileStats(null);
        setProfileError('Missing user session. Please log in again.');
        return false;
      }

      if (!hasAuthToken) {
        setProfileData(null);
        setProfileStats(null);
        setProfileError('Sign in to unlock your Smart Profile.');
        return false;
      }

      if (isDemoUser) {
        setProfileData(null);
        setProfileStats(null);
        setProfileError('Demo data is disabled. Complete an assessment after signing in.');
        return false;
      }

      if (showLoader) setIsProfileLoading(true);
      try {
        const [profileRes, progressRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getProgress(),
        ]);
        const profilePayload = profileRes.data;
        const progressPayload = progressRes.data;
        setProfileData(profilePayload);
        setProfileStats(progressPayload?.stats ?? null);
        setProfileForm({
          name: profilePayload?.profile?.name ?? '',
          avatarUrl: profilePayload?.profile?.avatarUrl ?? '',
        });
        setProfileError(null);
        if (profilePayload?.profile?.name) {
          localStorage.setItem('userName', profilePayload.profile.name);
        }
        return true;
      } catch (error) {
        console.error('Profile fetch failed', error);
        setProfileError('Unable to load profile right now.');
        return false;
      } finally {
        if (showLoader) setIsProfileLoading(false);
      }
    },
    [userId, hasAuthToken, isDemoUser]
  );

  const openProfilePanel = async () => {
    setIsProfilePanelOpen(true);
    if (!profileData || isDemoUser) {
      const ok = await refreshProfileData({ showLoader: true });
      if (!ok) {
        const message = !hasAuthToken || isDemoUser
          ? 'Sign in with your LakshPath account to unlock Smart Profile.'
          : 'Unable to load your profile right now.';
        showToast(message);
      }
    }
  };

  const closeProfilePanel = () => setIsProfilePanelOpen(false);

  const handleProfileInputChange = (field: 'name' | 'avatarUrl', value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async () => {
    if (!hasAuthToken) {
      showToast('Please log in to save profile updates.');
      return;
    }
    if (isDemoUser) {
      showToast('Demo data cannot be saved. Sign in with your real account to continue.');
      setProfileError('Smart Profile edits require a signed-in LakshPath account.');
      return;
    }
    if (!profileDirty) {
      showToast('No profile changes to save yet.');
      return;
    }
    setIsProfileSaving(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      };
      const { data } = await userAPI.updateProfile(payload);
      showToast('✅ Profile updated');
      setProfileData((prev) =>
        prev
          ? { ...prev, profile: data.profile }
          : { profile: data.profile, latestAssessment: null, activeRoadmap: null }
      );
      setProfileForm({
        name: data.profile.name ?? '',
        avatarUrl: data.profile.avatarUrl ?? '',
      });
      localStorage.setItem('userName', data.profile.name ?? '');
      await refreshProfileData({ showLoader: false });
    } catch (error) {
      console.error('Profile update failed', error);
      showToast('Unable to update profile right now.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleProfileRefresh = async () => {
    if (!hasAuthToken || isDemoUser) {
      setProfileError('Sign in with your LakshPath account to sync your profile.');
      showToast('Sign in to sync your Smart Profile.');
      return;
    }
    const ok = await refreshProfileData({ showLoader: true });
    showToast(ok ? '🔄 Profile synced with latest AI data.' : 'Unable to refresh profile right now.');
  };

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Copied to clipboard!');
    }).catch(() => {
      showToast('❌ Failed to copy');
    });
  };

  const openJobLink = (url?: string | null) => {
    if (!url) {
      showToast('🔐 Job link coming soon. We will notify you once it opens.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const normalizeAutoScoutMatches = (rows: any): AutoScoutMatch[] => {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      id: row.id ?? `auto-scout-${Date.now()}`,
      jobTitle: row.jobTitle,
      company: row.company ?? row.jobMeta?.company ?? null,
      summary: row.summary ?? '',
      matches: Array.isArray(row.matches) ? row.matches : [],
      gaps: Array.isArray(row.gaps) ? row.gaps : [],
      suggestions: Array.isArray(row.suggestions) ? row.suggestions : [],
      fastTrack: Array.isArray(row.fastTrack) ? row.fastTrack : [],
      jobMeta: row.jobMeta ?? null,
      createdAt: row.createdAt ?? new Date().toISOString(),
    }));
  };

  // View career details
  const viewCareerDetails = (career: CareerMatch) => {
    const message = `${career.title}\n\nMatch: ${career.match_score}%\nSalary: ${career.avg_salary}\nGrowth: ${career.growth_rate}\n\nKey Skills:\n${career.key_skills.map(s => `• ${s}`).join('\n')}`;
    alert(message);
  };

  // Set reminder
  const setReminder = (eventTitle?: string) => {
    showToast(`🔔 Reminder set for ${eventTitle ?? 'upcoming events'}!`);
  };

  // View all achievements
  const viewAllAchievements = () => {
    setActiveTab('community');
    showToast('🏆 Check out your achievements!');
  };

  // Connect LinkedIn
  const connectLinkedIn = () => {
    showToast('🔗 LinkedIn integration coming soon!');
  };

  // Upload Resume
  const uploadResume = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        showToast(`✅ ${file.name} uploaded! Processing...`);
        setTimeout(() => {
          showToast('🎉 Resume analyzed! Profile enhanced.');
        }, 2000);
      }
    };
    input.click();
  };

  // Join learning group
  const joinGroup = (groupName: string) => {
    showToast(`🎉 You've joined "${groupName}"!`);
  };

  // Request mentorship
  const requestMentorship = (mentorName: string) => {
    showToast(`📩 Mentorship request sent to ${mentorName}!`);
  };

  // Connect with student
  const connectWithStudent = (studentName: string) => {
    showToast(`🤝 Connection request sent to ${studentName}!`);
  };

  const refreshMicroCoach = () => {
    setMicroCoachRefreshKey((prev) => prev + 1);
  };

  const handleStartMicroTask = (task: MicroCoachTask) => {
    showToast(`🔥 Drill queued: ${task.title}`);
    if (task.resourceUrl) {
      window.open(task.resourceUrl, '_blank');
    }
  };

  const handleCompleteMicroTask = (task: MicroCoachTask) => {
    showToast(`✅ Logged ${task.title}. Keep compounding reps!`);
  };

  const formatTimestamp = (value?: string) => {
    if (!value) return 'Just now';
    return new Date(value).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scrollToMentorChat = () => {
    const target = document.getElementById('ai-mentor-chat');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setActiveTab('overview');
      showToast('AI mentor console is active inside the Overview tab.');
    }
  };

  const refreshMarketBrief = async () => {
    setIsRefreshingMarket(true);
    try {
      const { data } = await marketAPI.getBrief();
      setMarketBrief(data?.brief ?? null);
      showToast('📊 Market signals refreshed.');
    } catch (error) {
      console.error('Market brief refresh failed', error);
      showToast('Unable to refresh market insights right now.');
    } finally {
      setIsRefreshingMarket(false);
    }
  };

  const refreshAutoScout = async () => {
    if (!userId) {
      showToast('Please log in again to refresh auto-scout results.');
      return;
    }
    setIsAutoScoutRefreshing(true);
    try {
      const { data } = await jobsAPI.autoScout(userId, { refresh: true });
      setAutoScoutMatches(normalizeAutoScoutMatches(data?.autoScout?.matches));
      setAutoScoutDomain(ensureDomainValue(data?.autoScout?.domain));
      showToast('🛰️ Auto-scout matches refreshed.');
    } catch (error) {
      console.error('Auto-scout refresh failed', error);
      showToast('Auto-scout is warming up. Please try again soon.');
    } finally {
      setIsAutoScoutRefreshing(false);
    }
  };

  // Export career report
  const exportReport = () => {
    const userName = localStorage.getItem('userName') || 'Student';
    const careers = career_matches || [];
    
    let report = `LakshPath - Career Assessment Report\n`;
    report += `Student: ${userName}\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n\n`;
    report += `TOP CAREER MATCHES:\n\n`;
    
    careers.forEach((career: CareerMatch, idx: number) => {
      report += `${idx + 1}. ${career.title} - ${career.match_score}% Match\n`;
      report += `   ${career.description}\n`;
      report += `   Salary: ${career.avg_salary}\n`;
      report += `   Growth: ${career.growth_rate}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Career_Report_${userName}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📄 Career report exported!');
  };

  const handleJobCompareChange = (field: 'jobTitle' | 'company' | 'jobDescription', value: string) => {
    setJobCompareForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobComparison = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      showToast('Please log in again to analyze job descriptions.');
      return;
    }

    if (!jobCompareForm.jobTitle.trim() || !jobCompareForm.jobDescription.trim()) {
      showToast('Add a job title and description to compare.');
      return;
    }

    setIsComparingJob(true);
    try {
      const { data } = await jobsAPI.compare({
        userId,
        jobTitle: jobCompareForm.jobTitle.trim(),
        company: jobCompareForm.company.trim() || undefined,
        jobDescription: jobCompareForm.jobDescription.trim(),
      });

      const newEntry: JobComparison = {
        id: data?.record?.id ?? `comparison-${Date.now()}`,
        jobTitle: data?.record?.jobTitle ?? jobCompareForm.jobTitle,
  company: data?.record?.company ?? (jobCompareForm.company || null),
        matches: data?.analysis?.matches ?? [],
        gaps: data?.analysis?.gaps ?? [],
        suggestions: data?.analysis?.suggestions ?? [],
        fastTrack: data?.analysis?.fastTrackMilestones ?? [],
        summary: data?.analysis?.summary ?? '',
        source: 'MANUAL',
        createdAt: data?.record?.createdAt ?? new Date().toISOString(),
      };

      setJobComparisons((prev) => [newEntry, ...prev]);
      setJobCompareForm({ jobTitle: '', company: '', jobDescription: '' });
      showToast('✅ Gemini finished comparing that job!');
    } catch (error) {
      console.error('Job comparison failed', error);
      showToast('Unable to analyze that job right now. Try again soon.');
    } finally {
      setIsComparingJob(false);
    }
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!chatInput.trim()) return;

    if (!userId) {
      showToast('Please log in again to chat with the AI mentor.');
      return;
    }

    const messageContent = chatInput.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    setChatInput('');
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const { data } = await chatAPI.mentorRound({
        userId,
        message: messageContent,
        round: 'career',
        context: {
          assessmentSummary: assessmentResults?.quizResult?.summary,
          targetCareer: assessmentResults?.career_matches?.[0]?.title,
        },
      });

      const mentorReply = data?.reply;
      const mentorMessage: ChatMessage = {
        id: `mentor-${Date.now()}`,
        role: 'mentor',
        content: mentorReply?.summary ?? 'I need a moment. Please try again shortly.',
        createdAt: new Date().toISOString(),
        structured: mentorReply,
      };

      setChatMessages((prev) => [...prev, mentorMessage]);
    } catch (error) {
      console.error('Mentor chat failed', error);
      showToast('Mentor is offline at the moment. Please retry.');
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const stateResults = location.state?.assessmentResults;
    const storedResults = JSON.parse(localStorage.getItem('assessmentResults') || 'null');
    const initialResults = stateResults || storedResults;

    if (initialResults) {
      setAssessmentResults(initialResults);
      if (initialResults?.user?.id) {
        setUserId(initialResults.user.id);
        localStorage.setItem('userId', initialResults.user.id);
      }
    } else {
      const fallback = generateMockResults();
      setAssessmentResults(fallback);
      localStorage.setItem('assessmentResults', JSON.stringify(fallback));
      localStorage.setItem('assessmentCompleted', 'true');
    }

    setIsLoading(false);

    const derivedUserId =
      stateResults?.user?.id ||
      initialResults?.user?.id ||
      localStorage.getItem('userId');

    const targetUserId = derivedUserId || (hasAuthToken ? 'me' : null);

    if (!targetUserId) {
      setIsDataLoading(false);
      return;
    }

    if (targetUserId !== 'me') {
      setUserId(targetUserId);
    }

    let isMounted = true;

    const fetchLatest = async (userKey: string) => {
      if (!userKey || userKey === 'demo-user') {
        setIsSyncing(false);
        setErrorMessage(null);
        return;
      }

      setIsSyncing(true);
      setErrorMessage(null);
      try {
        const { data } = await assessmentAPI.getResults(userKey);
        if (!isMounted) return;
        setAssessmentResults(data);
        localStorage.setItem('assessmentResults', JSON.stringify(data));
        localStorage.setItem('assessmentCompleted', 'true');
        if (data?.user?.id) {
          setUserId(data.user.id);
          localStorage.setItem('userId', data.user.id);
        }
      } catch (error) {
        console.error('Failed to sync assessment results', error);
        if (!isMounted) return;

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setErrorMessage('No cloud assessment found yet. Complete the quiz to sync fresh AI insights.');
            return;
          }
          if (error.response?.status === 401) {
            setErrorMessage('Session expired. Please log in again to refresh your AI insights.');
            return;
          }
        }

        setErrorMessage('Unable to sync the latest AI insights. Showing your saved data.');
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    fetchLatest(targetUserId);

    return () => {
      isMounted = false;
    };
  }, [location, navigate, hasAuthToken]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const fetchAIStacks = async () => {
      setIsDataLoading(true);
      try {
        const [marketRes, jobsRes, comparisonsRes, autoScoutRes, insightsRes] = await Promise.all([
          marketAPI.getBrief(),
          jobsAPI.list(),
          jobsAPI.comparisons(userId),
          jobsAPI.autoScout(userId),
          insightsAPI.list(userId),
        ]);

        if (!isMounted) return;

        setMarketBrief(marketRes.data?.brief ?? null);
        setJobs(jobsRes.data?.jobs ?? []);

        const sanitizedComparisons: JobComparison[] = (comparisonsRes.data?.comparisons ?? []).map((row: any) => ({
          id: row.id,
          jobTitle: row.jobTitle,
          company: row.company,
          matches: Array.isArray(row.matches) ? row.matches : [],
          gaps: Array.isArray(row.gaps) ? row.gaps : [],
          suggestions: Array.isArray(row.suggestions) ? row.suggestions : [],
          fastTrack: Array.isArray(row.fastTrack) ? row.fastTrack : [],
          summary: row.summary ?? '',
          source: row.source ?? 'MANUAL',
          jobMeta: row.jobMeta ?? null,
          createdAt: row.createdAt ?? new Date().toISOString(),
        }));
        setJobComparisons(sanitizedComparisons);

        const autoScoutPayload = autoScoutRes.data?.autoScout;
        setAutoScoutMatches(normalizeAutoScoutMatches(autoScoutPayload?.matches));
        setAutoScoutDomain(ensureDomainValue(autoScoutPayload?.domain));

        const sanitizedInsights: InsightRow[] = (insightsRes.data?.insights ?? []).map((insight: any) => ({
          id: insight.id,
          summary: insight.summary,
          type: insight.type,
          createdAt: insight.createdAt ?? new Date().toISOString(),
          prompt: insight.prompt,
          metadata: insight.metadata ?? {},
        }));
        setInsights(sanitizedInsights);
      } catch (error) {
        console.error('Failed to load AI data', error);
        if (isMounted) {
          setErrorMessage((prev) => prev ?? 'Unable to refresh all AI widgets. Showing last saved responses.');
        }
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    fetchAIStacks();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const loadMicroCoach = async () => {
      if (userId === 'demo-user') {
        if (isMounted) {
          setMicroCoach(generateMockMicroCoach());
          setMicroCoachError(null);
          setIsMicroCoachLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsMicroCoachLoading(true);
        setMicroCoachError(null);
      }

      try {
        const { data } = await assessmentAPI.generateMicroCoach(userId);
        if (isMounted) {
          setMicroCoach(data);
        }
      } catch (error) {
        console.error('Micro-coach fetch failed', error);
        if (isMounted) {
          setMicroCoachError('Micro-coach is warming up. Try again soon.');
        }
      } finally {
        if (isMounted) {
          setIsMicroCoachLoading(false);
        }
      }
    };

    loadMicroCoach();

    return () => {
      isMounted = false;
    };
  }, [userId, microCoachRefreshKey]);

  useEffect(() => {
    if (!userId) return;
    refreshProfileData({ showLoader: false });
  }, [userId, refreshProfileData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateMockResults = () => {
    const domainInterestScores: Record<string, number> = {
      'Technology & Software': 5,
      'Healthcare & Medicine': 3,
      'Business & Finance': 4,
      'Arts & Design': 2,
      Engineering: 4,
      'Science & Research': 3,
    };

    const summary = {
      educationLevel: 'Undergraduate',
      fieldInterest: 'Technology & Software',
      motivation: 'Career Growth & Learning',
      workEnvironment: 'Hybrid (Mix of both)',
      workStyle: 'Both Equally (Adaptable)',
      salaryExpectation: '8-12 LPA',
      avgSkillScore: '4.2',
      skillRatings: {
        technical: 5,
        communication: 4,
        analytical: 4,
        creativity: 4,
      },
      domainInterests: domainInterestScores,
    };

    const careerMatches: CareerMatch[] = [
      {
        title: 'Software Engineer',
        match_score: 92,
        description:
          'Design, develop, and maintain software applications using modern programming languages and frameworks.',
        avg_salary: '₹8-15 LPA',
        growth_rate: '22% annually',
        key_skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git'],
      },
      {
        title: 'Data Scientist',
        match_score: 88,
        description: 'Analyze complex data sets to derive insights and build predictive models using machine learning.',
        avg_salary: '₹10-18 LPA',
        growth_rate: '28% annually',
        key_skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
      },
      {
        title: 'Product Manager',
        match_score: 85,
        description: 'Lead product strategy, development, and launch while coordinating with cross-functional teams.',
        avg_salary: '₹12-20 LPA',
        growth_rate: '18% annually',
        key_skills: ['Product Strategy', 'Analytics', 'Communication', 'Agile', 'User Research'],
      },
    ];

    return {
      user: {
        id: 'demo-user',
        name: 'Demo Learner',
        email: 'demo@lakshpath.ai',
      },
      summary,
      quizResult: {
        id: 'demo-quiz',
        createdAt: new Date().toISOString(),
        summary,
        strengths: ['Technical problem solving', 'Analytical reasoning'],
        weaknesses: ['Narrative confidence'],
      },
      career_matches: careerMatches,
      learning_roadmap: {
        id: 'demo-roadmap',
        title: `${careerMatches[0].title} Launch Plan`,
        duration: '6 months',
        summary: 'Demo roadmap generated locally',
        ai_plan: null,
        milestones: [
          {
            id: 1,
            title: 'Foundation Building',
            description: 'Master the fundamentals of programming and computer science concepts',
            duration: '2 months',
            status: 'completed' as const,
            resources: [
              { title: 'JavaScript Complete Guide', platform: 'Udemy', link: '#' },
              { title: 'CS50 - Harvard', platform: 'edX', link: '#' },
            ],
          },
          {
            id: 2,
            title: 'Web Development Basics',
            description: 'Learn HTML, CSS, and modern JavaScript frameworks',
            duration: '3 months',
            status: 'in-progress' as const,
            resources: [
              { title: 'React Complete Course', platform: 'Coursera', link: '#' },
              { title: 'Web Dev Bootcamp', platform: 'YouTube', link: '#' },
            ],
          },
          {
            id: 3,
            title: 'Backend Development',
            description: 'Build robust server-side applications with Node.js and databases',
            duration: '3 months',
            status: 'pending' as const,
            resources: [
              { title: 'Node.js Masterclass', platform: 'Udemy', link: '#' },
              { title: 'MongoDB University', platform: 'MongoDB', link: '#' },
            ],
          },
        ],
      },
      ai_insights: {
        explanation: {
          careers: careerMatches.map((career) => ({
            title: career.title,
            whyItFits: career.description,
            strengths: career.key_skills.slice(0, 2),
            weaknesses: ['Needs deeper storytelling'],
            personalizedAdvice: `Focus on ${career.key_skills[0]} and showcase one portfolio project each month.`,
          })),
        },
      },
      user_profile: {
        domain_interest_scores: domainInterestScores,
      },
    };
  };

  const { career_matches, learning_roadmap } = assessmentResults || {};
  const summaryData = assessmentResults?.quizResult?.summary || assessmentResults?.summary || {};
  const skillRatings = summaryData?.skillRatings || {};
  const domainInterestScores: Record<string, number> =
    summaryData?.domainInterests || assessmentResults?.user_profile?.domain_interest_scores || {};
  const sortedDomains = Object.entries(domainInterestScores).sort(
    (a, b) => (b[1] ?? 0) - (a[1] ?? 0)
  );
  const activeDomain = summaryData?.fieldInterest || sortedDomains[0]?.[0] || 'Technology & Software';
  const domainTheme = DOMAIN_THEMES[activeDomain as DomainKey] || DOMAIN_THEMES.default;
  const domainMarket = DOMAIN_MARKET_BLUEPRINTS[activeDomain as DomainKey] || DOMAIN_MARKET_BLUEPRINTS.default;
  const ratingToPercent = (value?: number) => {
    const numeric = typeof value === 'number' ? value : 3;
    return Math.round((numeric / 5) * 100);
  };
  const averageOf = (values: Array<number | undefined>) => {
    const valid = values.filter((value): value is number => typeof value === 'number');
    if (!valid.length) return 3;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  };
  const interestPercent = ratingToPercent(sortedDomains[0]?.[1]);
  const skillScorePercent = ratingToPercent(averageOf([skillRatings?.technical, skillRatings?.analytical]));
  const personalityScorePercent = ratingToPercent(
    averageOf([skillRatings?.communication, skillRatings?.creativity])
  );
  const interestBadges = [
    activeDomain,
    domainTheme.mission,
    summaryData?.motivation,
  ].filter(Boolean) as string[];
  const skillBadges = domainTheme.skillTags;
  const personalityBadges = [
    summaryData?.workStyle,
    summaryData?.workEnvironment,
    domainTheme.personalityTag,
  ].filter(Boolean) as string[];
  const normalizedCareerMatches = Array.isArray(career_matches) ? career_matches : [];
  const aiInsightAdvice = assessmentResults?.ai_insights?.explanation?.careers?.[0]?.personalizedAdvice;
  const aiInsightFallbackCareers = normalizedCareerMatches
    .slice(0, 3)
    .map((career) => career.title)
    .join(', ');
  const aiInsightText =
    aiInsightAdvice ||
    `${domainTheme.aiHook}${aiInsightFallbackCareers ? ` Focus on ${aiInsightFallbackCareers}.` : ''}`;
  const microCoachHeatmap = microCoach?.heatmap ?? [];
  const microCoachTasks = microCoach?.microTasks ?? [];
  const microCoachLastUpdated = microCoach?.generatedAt ? formatTimestamp(microCoach.generatedAt) : null;
  const domainRecommendations = [
    `Highlight your latest ${domainTheme.mission.toLowerCase()} win on LinkedIn to attract ${activeDomain} hiring squads.`,
    `Block a weekly 2-hour deep work slot for ${activeDomain} practice and log it in your tracker.`,
    `Ship a micro project that proves your ${domainTheme.personalityTag.toLowerCase()} edge with quantified outcomes.`,
  ];
  const recommendationsToShow: string[] =
    marketBrief?.recommendations && marketBrief.recommendations.length > 0
      ? marketBrief.recommendations
      : domainRecommendations;
  const hiringCards = [
    {
      key: 'high',
      title: 'HIGH DEMAND',
      gradientClass: 'from-green-500/20 to-emerald-500/20',
      borderClass: 'border-green-500',
      textClass: 'text-green-500',
      Icon: ArrowUpRight,
      band: domainMarket.hiringHighlights.highDemand,
    },
    {
      key: 'stable',
      title: 'STABLE GROWTH',
      gradientClass: 'from-yellow-500/20 to-orange-500/20',
      borderClass: 'border-yellow-500',
      textClass: 'text-yellow-500',
      Icon: TrendingUp,
      band: domainMarket.hiringHighlights.stable,
    },
    {
      key: 'declining',
      title: 'DECLINING',
      gradientClass: 'from-red-500/20 to-pink-500/20',
      borderClass: 'border-red-500',
      textClass: 'text-red-500',
      Icon: TrendingDown,
      band: domainMarket.hiringHighlights.declining,
    },
  ];

  const progressData = [
    { month: 'Jan', progress: 0 },
    { month: 'Feb', progress: 20 },
    { month: 'Mar', progress: 40 },
    { month: 'Apr', progress: 60 },
    { month: 'May', progress: 75 },
    { month: 'Jun', progress: 85 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'profile', label: 'Smart Profile', icon: <Brain className="w-5 h-5" /> },
    { id: 'careers', label: 'Career Matches', icon: <Target className="w-5 h-5" /> },
    { id: 'market', label: 'Live Market', icon: <Activity className="w-5 h-5" /> },
    { id: 'roadmap', label: 'Learning Path', icon: <MapPin className="w-5 h-5" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-5 h-5" /> },
    { id: 'jobs', label: 'Job Opportunities', icon: <Briefcase className="w-5 h-5" /> },
  ];

  const profileStatCards = [
    {
      label: 'Assessments',
      value: profileStats?.assessmentsCompleted ?? 0,
      Icon: Target,
    },
    {
      label: 'AI Insights',
      value: profileStats?.insightsGenerated ?? 0,
      Icon: Sparkles,
    },
    {
      label: 'Job Comparisons',
      value: profileStats?.jobsCompared ?? 0,
      Icon: FileText,
    },
    {
      label: 'Milestones',
      value: profileStats?.milestones?.completed ?? 0,
      sublabel: profileStats?.milestones?.total
        ? `of ${profileStats.milestones.total}`
        : undefined,
      Icon: CheckCircle,
    },
  ];

  const profileMemberSince = profileData?.profile?.createdAt
    ? new Date(profileData.profile.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const latestAssessmentSummary = (profileData?.latestAssessment?.summary ?? {}) as Record<string, any>;
  const profileFieldInterest = typeof latestAssessmentSummary?.fieldInterest === 'string' ? latestAssessmentSummary.fieldInterest : null;
  const profileMotivation = typeof latestAssessmentSummary?.motivation === 'string' ? latestAssessmentSummary.motivation : null;
  const profileAvgSkillScore = Number.parseFloat(latestAssessmentSummary?.avgSkillScore ?? '') || null;
  const latestAssessmentDate = profileData?.latestAssessment?.createdAt
    ? new Date(profileData.latestAssessment.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const activeProfileRoadmap = profileData?.activeRoadmap;
  const profileMilestoneStats = profileStats?.milestones;
  const profileMilestoneProgress = profileMilestoneStats?.total
    ? Math.round(((profileMilestoneStats.completed ?? 0) / Math.max(profileMilestoneStats.total, 1)) * 100)
    : null;

  const achievements = [
    { id: 1, title: 'First Assessment', icon: '🎯', date: 'Today' },
    { id: 2, title: 'Profile Complete', icon: '🏆', date: '2 days ago' },
    { id: 3, title: 'Fast Learner', icon: '⚡', date: '1 week ago' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Web Development Webinar', date: 'Nov 15, 2025', time: '6:00 PM', location: 'Virtual Event' },
    { id: 2, title: 'Career Counseling Session', date: 'Nov 18, 2025', time: '3:00 PM', location: 'LakshPath HQ, Delhi' },
    { id: 3, title: 'Mock Interview Practice', date: 'Nov 22, 2025', time: '5:00 PM', location: 'Online Cohort' },
  ];


  if (isLoading && !assessmentResults) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-semibold uppercase tracking-[0.3em] text-sm">
            Loading your dashboard...
          </p>
        </div>
        <AnimatePresence>
          {isProfilePanelOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProfilePanel}
            >
              <motion.div
                className="w-full max-w-4xl bg-black border border-white/10 rounded-lg p-8 overflow-y-auto max-h-[90vh]"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-black overflow-hidden border border-white/10">
                        {profileForm.avatarUrl ? (
                          <img
                            src={profileForm.avatarUrl}
                            alt="Profile avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>{profileAvatarInitial}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-primary-300">Smart Profile</p>
                        <h2 className="text-3xl font-black mt-1">{profileDisplayName}</h2>
                        <p className="text-gray-400 text-sm">{profileData?.profile?.email || 'Email not linked yet'}</p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-300">
                          {profileData?.profile?.role && (
                            <span className="px-3 py-1 border border-white/10 rounded-sm uppercase tracking-[0.3em]">{profileData.profile.role}</span>
                          )}
                          {profileMemberSince && (
                            <span className="px-3 py-1 border border-white/10 rounded-sm">Member since {profileMemberSince}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end">
                      <motion.button
                        onClick={handleProfileRefresh}
                        className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-sm text-sm uppercase tracking-[0.3em]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isProfileLoading}
                      >
                        {isProfileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                        REFRESH
                      </motion.button>
                      <motion.button
                        onClick={closeProfilePanel}
                        className="p-2 rounded-sm border border-white/10"
                        whileHover={{ scale: 1.05 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {profileError && (
                    <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm rounded-sm">
                      {profileError}
                    </div>
                  )}

                  {isProfileLoading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading your profile...</span>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-4">
                        {profileStatCards.map((card) => (
                          <div key={card.label} className="bg-white/5 border border-white/10 rounded-sm p-4 flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-sm">
                              <card.Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{card.label}</p>
                              <p className="text-2xl font-black">{card.value}</p>
                              {card.sublabel && <p className="text-xs text-gray-400">{card.sublabel}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-sm p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Latest Assessment</p>
                              <h3 className="text-xl font-black">{latestAssessmentDate || 'No assessment yet'}</h3>
                            </div>
                            <Sparkles className="w-6 h-6 text-primary-400" />
                          </div>
                          {latestAssessmentDate ? (
                            <div className="space-y-2 text-sm text-gray-200">
                              {profileFieldInterest && <p><span className="text-gray-400">Focus:</span> {profileFieldInterest}</p>}
                              {profileMotivation && <p><span className="text-gray-400">Motivation:</span> {profileMotivation}</p>}
                              {profileAvgSkillScore && (
                                <p>
                                  <span className="text-gray-400">Avg Skill Score:</span> {profileAvgSkillScore}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Complete your first assessment to unlock insights.</p>
                          )}
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-sm p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Active Roadmap</p>
                              <h3 className="text-xl font-black">{activeProfileRoadmap?.title || 'Not generated yet'}</h3>
                            </div>
                            <MapPin className="w-6 h-6 text-green-400" />
                          </div>
                          {activeProfileRoadmap ? (
                            <div className="space-y-3 text-sm text-gray-200">
                              {activeProfileRoadmap.summary && <p>{activeProfileRoadmap.summary}</p>}
                              {activeProfileRoadmap.duration && (
                                <p className="text-gray-400">Duration: {activeProfileRoadmap.duration}</p>
                              )}
                              {profileMilestoneProgress !== null && (
                                <div>
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Progress</span>
                                    <span>{profileMilestoneProgress}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-white/10 rounded-sm mt-1">
                                    <div
                                      className="h-2 rounded-sm bg-green-400"
                                      style={{ width: `${profileMilestoneProgress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Generate your roadmap from the Learning Path tab.</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Profile Settings</p>
                            <h3 className="text-2xl font-black">Update your identity</h3>
                          </div>
                          {isProfileSaving && <Loader2 className="w-5 h-5 animate-spin text-white" />}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Full Name</label>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(event) => handleProfileInputChange('name', event.target.value)}
                              className="mt-2 w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/40"
                              placeholder="Add your name"
                            />
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Avatar URL</label>
                            <input
                              type="url"
                              value={profileForm.avatarUrl}
                              onChange={(event) => handleProfileInputChange('avatarUrl', event.target.value)}
                              className="mt-2 w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/40"
                              placeholder="https://"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-6">
                          <motion.button
                            onClick={handleProfileSave}
                            disabled={isProfileSaving || !profileDirty}
                            className="px-6 py-3 bg-white text-black font-black rounded-sm disabled:opacity-40"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isProfileSaving ? 'Saving...' : 'Save changes'}
                          </motion.button>
                          <motion.button
                            onClick={handleProfileRefresh}
                            className="px-6 py-3 border border-white/20 rounded-sm font-black"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Sync from AI
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setProfileForm((prev) => ({
                                ...prev,
                                name: assessmentResults?.user?.name || profileDisplayName,
                              }));
                            }}
                            className="px-6 py-3 border border-white/10 rounded-sm font-black text-gray-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Restore name from assessment
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 z-50 bg-white text-black px-8 py-4 rounded-lg shadow-2xl flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="font-bold">{notificationMessage}</span>
            <button onClick={() => setShowNotification(false)}>
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-sm flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">LAKSHPATH</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={openProfilePanel}
                className="flex items-center gap-3 px-4 py-2 border border-white/20 rounded-sm hover:bg-white/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {profileForm.avatarUrl ? (
                  <img
                    src={profileForm.avatarUrl}
                    alt="Profile avatar"
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black">
                    {profileAvatarInitial}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold leading-none">{profileDisplayName}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Profile</p>
                </div>
              </motion.button>
              <motion.button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-500 rounded-sm hover:bg-red-500/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold">LOGOUT</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {isSyncing && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3 rounded-sm border border-primary-500/40 bg-primary-500/10 text-primary-100 text-sm font-bold tracking-[0.3em] uppercase">
            <div className="w-3 h-3 bg-primary-300 rounded-full animate-pulse" />
            Syncing latest AI insights...
          </div>
        )}

        {isDataLoading && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3 rounded-sm border border-blue-500/40 bg-blue-500/10 text-blue-100 text-sm font-bold tracking-[0.3em] uppercase">
            <Loader2 className="w-4 h-4 animate-spin" />
            Warming up AI copilots...
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3 rounded-sm border border-yellow-500/40 bg-yellow-500/10 text-yellow-100 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Welcome Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-6xl font-black mb-4">
            WELCOME BACK, <span className="bg-gradient-to-r from-primary-500 to-blue-500 bg-clip-text text-transparent">
              {(localStorage.getItem('userName') || 'USER').toUpperCase()}
            </span>
          </h1>
          <p className="text-gray-400 text-xl">Your AI-powered career intelligence dashboard</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 rounded-sm font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span>{tab.label.toUpperCase()}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Briefcase className="w-12 h-12 text-primary-500 mb-4" />
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Career Matches</p>
                <p className="text-5xl font-black">{career_matches?.length || 0}</p>
              </motion.div>

              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <BookOpen className="w-12 h-12 text-blue-500 mb-4" />
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Milestones</p>
                <p className="text-5xl font-black">{learning_roadmap?.milestones?.length || 0}</p>
              </motion.div>

              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Achievements</p>
                <p className="text-5xl font-black">5</p>
              </motion.div>
            </div>

            {/* Learning Progress Chart */}
            <motion.div
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 rounded-lg shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-black uppercase bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                    Learning Progress
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">Track your growth over time</p>
                </div>
                <motion.button
                  onClick={() => showToast('Download feature coming soon!')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg hover:from-primary-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-primary-500/50"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold text-sm">EXPORT REPORT</span>
                </motion.button>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Line Chart - Progress Trend */}
                <div className="lg:col-span-2 bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h4 className="text-lg font-bold uppercase text-gray-200">Progress Trend</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={progressData}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#888" 
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                        tick={{ fill: '#888' }}
                      />
                      <YAxis 
                        stroke="#888" 
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                        tick={{ fill: '#888' }}
                        label={{ value: 'Progress %', angle: -90, position: 'insideLeft', fill: '#888' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: '#6366f1', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="progress" 
                        stroke="#6366f1" 
                        strokeWidth={4}
                        dot={{ fill: '#6366f1', r: 6, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
                        fill="url(#progressGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart - Skills Distribution */}
                <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h4 className="text-lg font-bold uppercase text-gray-200">Skills Balance</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Technical', value: 35, fill: '#6366f1' },
                          { name: 'Soft Skills', value: 25, fill: '#818cf8' },
                          { name: 'Domain', value: 20, fill: '#3b82f6' },
                          { name: 'Leadership', value: 20, fill: '#60a5fa' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { name: 'Technical', value: 35, fill: '#6366f1' },
                          { name: 'Soft Skills', value: 25, fill: '#818cf8' },
                          { name: 'Domain', value: 20, fill: '#3b82f6' },
                          { name: 'Leadership', value: 20, fill: '#60a5fa' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      { name: 'Technical', color: '#6366f1', value: '35%' },
                      { name: 'Soft Skills', color: '#818cf8', value: '25%' },
                      { name: 'Domain', color: '#3b82f6', value: '20%' },
                      { name: 'Leadership', color: '#60a5fa', value: '20%' },
                    ].map((skill) => (
                      <div key={skill.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }} />
                        <span className="text-gray-400">{skill.name}</span>
                        <span className="font-bold text-white ml-auto">{skill.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.button
                onClick={exportReport}
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-10 h-10 text-primary-500 mb-4 group-hover:scale-110 transition" />
                <p className="text-xl font-black uppercase mb-2">Download Roadmap</p>
                <p className="text-gray-400 text-sm">Export your learning path as PDF</p>
              </motion.button>

              <motion.button
                onClick={() =>
                  copyToClipboard(
                    `LakshPath Snapshot\nTop Match: ${career_matches?.[0]?.title ?? 'N/A'} (${career_matches?.[0]?.match_score ?? '--'}%)\nMilestones Ready: ${learning_roadmap?.milestones?.length ?? 0}`
                  )
                }
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition" />
                <p className="text-xl font-black uppercase mb-2">Share Progress</p>
                <p className="text-gray-400 text-sm">Show your achievements</p>
              </motion.button>

              <motion.button
                onClick={scrollToMentorChat}
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition" />
                <p className="text-xl font-black uppercase mb-2">Ask AI Mentor</p>
                <p className="text-gray-400 text-sm">Jump to the live mentor chat</p>
              </motion.button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary-400" />
                    <h3 className="text-2xl font-black uppercase">Latest AI Insights</h3>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase">{insights.length} updates</span>
                </div>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {insights.length ? (
                    insights.slice(0, 5).map((insight) => (
                      <div key={insight.id} className="border-l-2 border-primary-500/60 pl-4 py-2 bg-black/40 rounded-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-white">{insight.summary}</p>
                          <span className="text-[10px] uppercase tracking-wide text-gray-400">{formatTimestamp(insight.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-400 uppercase">{(insight.type || 'INSIGHT').replace(/_/g, ' ')}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      Complete an assessment or run a JD comparison to see Gemini insights here.
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                id="ai-mentor-chat"
                className="bg-white/5 border border-white/10 p-8 rounded-sm flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-2xl font-black uppercase">AI Mentor</h3>
                  </div>
                  {isChatLoading && <Loader2 className="w-5 h-5 text-white animate-spin" />}
                </div>
                <div className="flex-1 bg-black/40 border border-white/5 rounded-sm p-4 space-y-3 overflow-y-auto mb-4 flex flex-col">
                  {chatMessages.map((message) => {
                    if (message.role === 'mentor' && message.structured) {
                      const actionPlan = message.structured.actionPlan ?? [];
                      const followUps = message.structured.followUps ?? [];
                      const nudges = message.structured.nudges ?? [];
                      const references = message.structured.references ?? [];
                      const confidencePercent = Math.min(
                        100,
                        Math.max(0, Math.round(((message.structured.confidence ?? 0.65) * 100)))
                      );

                      return (
                        <div
                          key={message.id}
                          className="w-full bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-blue-500/10 border border-green-500/30 text-white rounded-sm p-4 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-green-200 mb-1">Mentor</p>
                              <p className="text-xl font-black leading-tight">{message.structured.headline || 'AI Mentor Update'}</p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-1">Confidence</p>
                              <div className="w-32 h-2 bg-white/10 rounded-sm overflow-hidden">
                                <div
                                  className="h-2 bg-green-400"
                                  style={{ width: `${confidencePercent}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-200 mt-1">{confidencePercent}% sure</p>
                            </div>
                          </div>

                          <p className="text-sm leading-relaxed text-gray-100">{message.structured.summary || message.content}</p>

                          {actionPlan.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-2">Action Plan</p>
                              <div className="space-y-3">
                                {actionPlan.map((step, idx) => (
                                  <div
                                    key={`${message.id}-step-${idx}`}
                                    className="bg-black/40 border border-white/10 rounded-sm p-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="font-black text-white">{step.title}</p>
                                      {step.priority && (
                                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide border border-white/20 rounded-sm text-gray-200">
                                          {step.priority}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-200 mt-1">{step.detail}</p>
                                    {step.impact && (
                                      <p className="text-xs text-green-300 mt-1">Impact: {step.impact}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {followUps.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-2">Follow-up Questions</p>
                              <ul className="space-y-2 text-sm text-gray-100 list-disc pl-5">
                                {followUps.map((follow, idx) => (
                                  <li key={`${message.id}-follow-${idx}`}>
                                    <span className="font-semibold text-white">{follow.question}</span>
                                    <span className="block text-gray-300 text-xs">Why: {follow.why}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {nudges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {nudges.map((nudge, idx) => (
                                <span
                                  key={`${message.id}-nudge-${idx}`}
                                  className="px-3 py-1 text-xs font-black uppercase bg-white/10 border border-white/20 rounded-sm"
                                >
                                  {nudge}
                                </span>
                              ))}
                            </div>
                          )}

                          {references.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-1">References</p>
                              <ul className="list-disc pl-5 text-xs text-gray-200 space-y-1">
                                {references.map((reference, idx) => (
                                  <li key={`${message.id}-ref-${idx}`}>{reference}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <p className="text-[10px] uppercase tracking-wide text-gray-300">
                            {formatTimestamp(message.createdAt)}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={`max-w-[90%] px-4 py-2 rounded-sm text-sm leading-relaxed ${
                          message.role === 'mentor'
                            ? 'bg-green-500/20 border border-green-500/40 text-green-100 self-start'
                            : 'bg-white/10 border border-white/20 text-white self-end ml-auto'
                        }`}
                      >
                        <p className="font-semibold mb-1">{message.role === 'mentor' ? 'Mentor' : 'You'}</p>
                        <p>{message.content}</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-2">{formatTimestamp(message.createdAt)}</p>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about interviews, skills, or roadmap..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/40"
                  />
                  <motion.button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="px-5 py-3 bg-green-500 text-black font-black rounded-sm flex items-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>SEND</span>
                  </motion.button>
                </form>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-2xl font-black uppercase">Recent Achievements</h3>
                  </div>
                  <motion.button
                    onClick={viewAllAchievements}
                    className="text-sm font-bold text-gray-400 hover:text-white transition"
                    whileHover={{ scale: 1.05 }}
                  >
                    VIEW ALL
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center justify-between bg-black/40 border border-white/5 rounded-sm px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center text-2xl">
                          {achievement.icon}
                        </div>
                        <div>
                          <p className="font-black">{achievement.title}</p>
                          <p className="text-xs text-gray-400 uppercase">Milestone unlocked</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{achievement.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-8 h-8 text-primary-400" />
                  <h3 className="text-2xl font-black uppercase">Upcoming Events</h3>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-black/40 border border-white/5 rounded-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black">{event.title}</p>
                          <p className="text-gray-400 text-sm">{event.date} • {event.time}</p>
                        </div>
                        <motion.button
                          onClick={() => setReminder(event.title)}
                          className="text-xs font-black px-3 py-1 border border-white/20 rounded-sm hover:bg-white/10 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          SET REMINDER
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPinned className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Career Matches Tab */}
        {activeTab === 'careers' && (
          <div className="space-y-8">
            {career_matches?.map((career: CareerMatch, index: number) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 p-8 rounded-sm hover:bg-white/10 transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-4xl font-black mb-2">{career.title.toUpperCase()}</h3>
                    <p className="text-gray-400">{career.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-primary-500">{career.match_score}%</div>
                    <p className="text-gray-400 text-sm uppercase">Match Score</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/50 p-4 rounded-sm border border-green-500/20">
                    <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
                    <p className="text-gray-400 text-sm uppercase mb-1">Growth Rate</p>
                    <p className="text-xl font-black">{career.growth_rate}</p>
                  </div>
                  <div className="bg-black/50 p-4 rounded-sm border border-blue-500/20">
                    <Briefcase className="w-6 h-6 text-blue-500 mb-2" />
                    <p className="text-gray-400 text-sm uppercase mb-1">Average Salary</p>
                    <p className="text-xl font-black">{career.avg_salary}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-400 text-sm uppercase mb-3">Key Skills Required</p>
                  <div className="flex flex-wrap gap-2">
                    {career.key_skills?.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-sm text-sm font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={() => navigate('/learn')}
                  className="w-full bg-white text-black py-4 rounded-sm font-black text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  START LEARNING PATH <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => viewCareerDetails(career)}
                  className="w-full mt-3 border border-white/20 text-white py-3 rounded-sm font-bold text-base hover:bg-white/10 transition"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  VIEW DETAILS
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Learning Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8">
            {learning_roadmap?.milestones?.map((milestone: Milestone, index: number) => (
              <motion.div
                key={milestone.id}
                className={`bg-white/5 border rounded-sm p-8 ${
                  milestone.status === 'completed' ? 'border-green-500/50' :
                  milestone.status === 'in-progress' ? 'border-blue-500/50' :
                  'border-white/10'
                } hover:bg-white/10 transition`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-sm flex items-center justify-center ${
                      milestone.status === 'completed' ? 'bg-green-500' :
                      milestone.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-white/10'
                    }`}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : milestone.status === 'in-progress' ? (
                        <Clock className="w-8 h-8 text-white" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black mb-2">{milestone.title.toUpperCase()}</h3>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-sm text-xs font-black uppercase ${
                    milestone.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                    milestone.status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {milestone.status.replace('-', ' ')}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {milestone.resources?.map((resource, idx) => (
                    <div key={idx} className="bg-black/50 border border-white/10 p-4 rounded-sm">
                      <p className="font-black mb-1">{resource.title}</p>
                      <p className="text-sm text-gray-400">{resource.platform}</p>
                    </div>
                  ))}
                </div>

                {milestone.status !== 'completed' && (
                  <motion.button
                    onClick={() => showToast(`Starting ${milestone.title}...`)}
                    className="w-full bg-white text-black py-4 rounded-sm font-black hover:bg-gray-200 transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {milestone.status === 'in-progress' ? 'CONTINUE LEARNING' : 'START MILESTONE'}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Smart Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Profile Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Brain className="w-12 h-12 text-white mb-4" />
                <p className="text-purple-200 text-sm uppercase">AI Analysis</p>
                <p className="text-3xl font-black text-white mb-2">Complete</p>
                <p className="text-purple-200 text-sm">10,000+ career paths analyzed</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-blue-600 to-cyan-700 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="w-12 h-12 text-white mb-4" />
                <p className="text-blue-200 text-sm uppercase">Career DNA</p>
                <p className="text-3xl font-black text-white mb-2">Mapped</p>
                <p className="text-blue-200 text-sm">Your unique career blueprint</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <FileText className="w-12 h-12 text-white mb-4" />
                <p className="text-green-200 text-sm uppercase">Data Sources</p>
                <p className="text-3xl font-black text-white mb-2">2</p>
                <p className="text-green-200 text-sm">Quiz + Resume analysis</p>
              </motion.div>
            </div>

            {/* Career DNA Breakdown */}
            <motion.div
              className="bg-white/5 border border-white/10 p-8 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-3xl font-black mb-8">YOUR CAREER DNA BREAKDOWN</h3>
              
              <div className="space-y-8">
                {/* Interests */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-6 h-6 text-red-500" />
                      <span className="text-xl font-black">INTERESTS & PASSION</span>
                    </div>
                    <span className="text-3xl font-black text-red-500">{interestPercent}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-sm h-4 mb-4">
                    <div
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-4 rounded-sm"
                      style={{ width: `${interestPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {interestBadges.map((badge) => (
                      <span
                        key={badge}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-sm text-sm font-black uppercase"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      <span className="text-xl font-black">{domainTheme.skillHeadline}</span>
                    </div>
                    <span className="text-3xl font-black text-yellow-500">{skillScorePercent}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-sm h-4 mb-4">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-sm"
                      style={{ width: `${skillScorePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillBadges.map((badge) => (
                      <span
                        key={badge}
                        className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-sm text-sm font-black uppercase"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-purple-500 fill-purple-500" />
                      <span className="text-xl font-black">PERSONALITY TRAITS</span>
                    </div>
                    <span className="text-3xl font-black text-purple-500">{personalityScorePercent}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-sm h-4 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-sm"
                      style={{ width: `${personalityScorePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {personalityBadges.map((badge) => (
                      <span
                        key={badge}
                        className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-sm text-sm font-black uppercase"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-sm">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="font-black text-lg mb-2">AI INSIGHT</p>
                    <p className="text-gray-400">{aiInsightText}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 border border-white/10 p-8 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-2xl font-black uppercase">MICRO-COACH DRILLS</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {microCoachLastUpdated ? `Updated ${microCoachLastUpdated}` : 'LIVE'}
                  </span>
                  <motion.button
                    onClick={refreshMicroCoach}
                    disabled={isMicroCoachLoading}
                    className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-sm text-xs font-black hover:bg-white/10 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMicroCoachLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    REFRESH
                  </motion.button>
                </div>
              </div>

              {isMicroCoachLoading ? (
                <div className="flex items-center gap-3 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating personalized drills...</span>
                </div>
              ) : microCoachError ? (
                <p className="text-sm text-yellow-300">{microCoachError}</p>
              ) : microCoach ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm uppercase text-gray-400 tracking-[0.3em] mb-3">Skill Heatmap</p>
                    <div className="space-y-4">
                      {microCoachHeatmap.length ? (
                        microCoachHeatmap.map((entry) => (
                          <div key={entry.name} className="bg-black/40 border border-white/5 rounded-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-xs uppercase text-gray-400">{entry.name}</p>
                                <p className="font-black">{entry.sentiment}</p>
                              </div>
                              <span className="text-sm text-gray-400">{entry.score}/5</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-sm">
                              <div
                                className="h-2 rounded-sm bg-gradient-to-r from-red-500 to-pink-500"
                                style={{ width: `${ratingToPercent(entry.score)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">Complete your assessment to unlock the skill heatmap.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm uppercase text-gray-400 tracking-[0.3em] mb-3">Next Actions</p>
                    <div className="space-y-4">
                      {microCoachTasks.length ? (
                        microCoachTasks.map((task, idx) => (
                          <div key={`${task.title}-${idx}`} className="bg-black/40 border border-white/5 rounded-sm p-4 space-y-3">
                            <div>
                              <p className="text-xs uppercase text-gray-400">{task.skill}</p>
                              <p className="text-lg font-black">{task.title}</p>
                            </div>
                            <p className="text-sm text-gray-300">{task.description}</p>
                            <div className="flex flex-wrap gap-3">
                              <motion.button
                                onClick={() => handleStartMicroTask(task)}
                                className="px-4 py-2 bg-white text-black text-xs font-black rounded-sm"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                START DRILL
                              </motion.button>
                              <motion.button
                                onClick={() => handleCompleteMicroTask(task)}
                                className="px-4 py-2 border border-white/30 text-xs font-black rounded-sm"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                MARK DONE
                              </motion.button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">We will drop micro-tasks here after your first AI assessment.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Run an assessment to unlock your personalized drills.</p>
              )}
            </motion.div>

            {/* LinkedIn/Resume Integration */}
            <motion.div
              className="bg-blue-500/10 border-2 border-blue-500/30 p-8 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 p-6 rounded-sm">
                  <Linkedin className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-3">ENHANCE YOUR PROFILE</h3>
                  <p className="text-gray-400 mb-6 text-lg">
                    Upload your resume or connect LinkedIn for deeper AI analysis and better career matching
                  </p>
                  <div className="flex gap-4">
                    <motion.button 
                      onClick={connectLinkedIn}
                      className="px-8 py-4 bg-blue-600 text-white rounded-sm font-black hover:bg-blue-700 transition flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-5 h-5" />
                      CONNECT LINKEDIN
                    </motion.button>
                    <motion.button 
                      onClick={uploadResume}
                      className="px-8 py-4 border-2 border-white text-white rounded-sm font-black hover:bg-white/10 transition flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FileText className="w-5 h-5" />
                      UPLOAD RESUME
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Live Market Tab */}
        {activeTab === 'market' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black">LIVE MARKET INTELLIGENCE</h2>
                <p className="text-gray-400 text-lg mt-2">Real-time {activeDomain} job market data & emerging trends</p>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-black text-green-500 uppercase">Live Data</span>
              </div>
            </div>

            <motion.div
              className="bg-white/5 border border-white/10 p-8 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase">Auto-Scout Matches</h3>
                  <p className="text-gray-400 text-sm">
                    Gemini is scanning {autoScoutDomain} roles and ranking the best fits for your profile.
                  </p>
                </div>
                <motion.button
                  onClick={refreshAutoScout}
                  disabled={isAutoScoutRefreshing}
                  className="px-4 py-2 border border-white/20 rounded-sm text-xs font-black flex items-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: isAutoScoutRefreshing ? 1 : 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isAutoScoutRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-4 h-4" />
                  )}
                  {isAutoScoutRefreshing ? 'Refreshing' : 'Refresh' }
                </motion.button>
              </div>
              {autoScoutMatches.length ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  {autoScoutMatches.map((match) => (
                    <div key={match.id} className="bg-black/40 border border-white/5 rounded-sm p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xl font-black">{match.jobTitle}</p>
                          <p className="text-gray-400 text-sm">{match.company ?? match.jobMeta?.company ?? 'Stealth Company'}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{match.jobMeta?.postedAgo ?? formatTimestamp(match.createdAt)}</p>
                          {match.jobMeta?.location && <p className="mt-1 text-gray-400">{match.jobMeta.location}</p>}
                        </div>
                      </div>
                      {match.summary && (
                        <p className="text-sm text-gray-300">{match.summary}</p>
                      )}
                      {match.matches.length ? (
                        <div className="text-xs text-green-300">
                          <span className="font-black uppercase mr-2">Top Matches</span>
                          {match.matches.slice(0, 2).join(', ')}
                        </div>
                      ) : null}
                      {match.gaps.length ? (
                        <div className="text-xs text-yellow-200">
                          <span className="font-black uppercase mr-2">Mind these</span>
                          {match.gaps[0]}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {(match.jobMeta?.tags ?? []).slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-white/10 border border-white/10 rounded-sm text-[10px] font-semibold uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{match.jobMeta?.salary ?? '—'}</span>
                        <span>{match.jobMeta?.type ?? ''}</span>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <motion.button
                          onClick={() => openJobLink(match.jobMeta?.jobUrl)}
                          className="flex-1 bg-white text-black py-2 rounded-sm text-xs font-black"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          VIEW ROLE
                        </motion.button>
                        <motion.button
                          onClick={() => copyToClipboard(`LakshPath auto-scout → ${match.jobTitle}: ${match.summary}`)}
                          className="px-3 border border-white/20 text-white rounded-sm text-xs font-black"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          COPY NOTE
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Auto-scout is warming up — we will stream matches once Gemini finishes scanning your market.</p>
              )}
            </motion.div>

            <motion.div
              className="bg-white/5 border border-white/10 p-8 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">Gemini Summary</p>
                  <h3 className="text-3xl font-black mb-2">{marketBrief?.title ?? 'Awaiting market signal'}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {marketBrief?.deltaSummary ?? 'Complete your assessment or refresh to pull the latest hiring pulse powered by Gemini.'}
                  </p>
                </div>
                <motion.button
                  onClick={refreshMarketBrief}
                  disabled={isRefreshingMarket}
                  className="self-start px-5 py-3 border border-white/20 rounded-sm font-bold flex items-center gap-2 hover:bg-white/10 disabled:opacity-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isRefreshingMarket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  REFRESH SIGNAL
                </motion.button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                {recommendationsToShow.map((item, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-sm p-4">
                    <p className="text-xs text-gray-400 uppercase">Play #{idx + 1}</p>
                    <p className="font-black mt-2">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Market Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <motion.div
                className="bg-gradient-to-br from-blue-600 to-cyan-700 p-6 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                <Layers className="w-10 h-10 text-white mb-3 opacity-80" />
                <p className="text-blue-200 text-sm uppercase">Data Sources</p>
                <p className="text-4xl font-black text-white mt-2">10+</p>
                <p className="text-blue-200 text-xs mt-2">Job Portals Connected</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Activity className="w-10 h-10 text-white mb-3 opacity-80" />
                <p className="text-purple-200 text-sm uppercase">Daily Job Analysis</p>
                <p className="text-4xl font-black text-white mt-2">50K+</p>
                <p className="text-purple-200 text-xs mt-2">Postings Tracked</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="w-10 h-10 text-white mb-3 opacity-80" />
                <p className="text-green-200 text-sm uppercase">Emerging Skills</p>
                <p className="text-4xl font-black text-white mt-2">247</p>
                <p className="text-green-200 text-xs mt-2">New This Month</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-red-600 to-pink-700 p-6 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <TrendingDown className="w-10 h-10 text-white mb-3 opacity-80" />
                <p className="text-red-200 text-sm uppercase">Declining Roles</p>
                <p className="text-4xl font-black text-white mt-2">12</p>
                <p className="text-red-200 text-xs mt-2">Flagged This Week</p>
              </motion.div>
            </div>

            {/* Trending Alert */}
            <motion.div
              className="bg-yellow-500/10 border-2 border-yellow-500/50 p-8 rounded-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-6">
                <div className="bg-yellow-500 p-4 rounded-sm animate-pulse">
                  <Bell className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-black">🔥 TRENDING ALERT</h3>
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-sm animate-bounce">NEW</span>
                  </div>
                  <p className="text-white font-bold text-lg mb-2">
                    {domainMarket.trendingSkill.headline}
                  </p>
                  <p className="text-gray-400 mb-4">
                    {domainMarket.trendingSkill.description}
                  </p>
                  <div className="flex gap-4">
                    <motion.button 
                      onClick={() => showToast(domainMarket.trendingSkill.actionToast)}
                      className="px-6 py-3 bg-yellow-500 text-black rounded-sm font-black hover:bg-yellow-600 transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {domainMarket.trendingSkill.ctaLabel}
                    </motion.button>
                    <motion.button 
                      onClick={() => window.open(domainMarket.trendingSkill.learnMoreUrl, '_blank')}
                      className="px-6 py-3 border-2 border-yellow-500 text-yellow-500 rounded-sm font-black hover:bg-yellow-500/10 transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      LEARN MORE
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Market Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Salary Trends */}
              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Gauge className="w-8 h-8 text-primary-500" />
                  <h3 className="text-xl font-black">{`SALARY TRENDS - ${domainMarket.salaryRoleLabel.toUpperCase()}`}</h3>
                </div>
                <div className="space-y-6">
                  {domainMarket.salaryTrends.map((band) => {
                    const isPositive = band.change.trim().startsWith('↑');
                    return (
                      <div key={band.label}>
                        <div className="flex justify-between mb-3">
                          <span className="text-gray-400 uppercase text-sm">{band.label}</span>
                          <span className="font-black text-xl">{band.range}</span>
                        </div>
                        <div className={`flex gap-2 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          <span className="font-bold">{band.change}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-sm">
                  <p className="text-sm text-gray-300">
                    <span className="font-black text-blue-500">INSIGHT:</span> {domainMarket.salaryInsight}
                  </p>
                </div>
              </motion.div>

              {/* Hiring Patterns */}
              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <LineChart className="w-8 h-8 text-purple-500" />
                  <h3 className="text-xl font-black">HIRING PATTERNS</h3>
                </div>
                <div className="space-y-4">
                  {hiringCards.map((card) => (
                    <div
                      key={card.key}
                      className={`p-4 bg-gradient-to-r ${card.gradientClass} border-l-4 ${card.borderClass} rounded-sm`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black">{card.title}</span>
                        <card.Icon className={`w-6 h-6 ${card.textClass}`} />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{card.band.roles.join(', ')}</p>
                      <span className={`px-3 py-1 bg-white/5 ${card.textClass} rounded-sm text-xs font-black`}>
                        {card.band.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black">LIVE JOB OPPORTUNITIES</h2>
                <p className="text-gray-400 text-lg mt-2">Curated {activeDomain} feeds matched to your assessment profile</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => showToast('Filters launching soon – we are tracking your preferences!')}
                  className="px-6 py-3 border border-white/20 rounded-sm hover:bg-white/5 transition flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-5 h-5" />
                  FILTER
                </motion.button>
                <motion.button
                  onClick={() => showToast('Search is in beta. Ping us for early access!')}
                  className="px-6 py-3 border border-white/20 rounded-sm hover:bg-white/5 transition flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="w-5 h-5" />
                  SEARCH
                </motion.button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {jobs.length ? (
                  jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      className="bg-white/5 border border-white/10 p-8 rounded-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-3xl font-black mb-1">{job.title}</h3>
                          <p className="text-gray-400">{job.company} • {job.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase text-gray-500">{job.postedAgo ?? 'Just now'}</p>
                          <p className="text-sm text-primary-300 font-black">{job.domain}</p>
                          <p className="text-sm uppercase text-gray-400 mt-1">Experience</p>
                          <p className="font-black text-lg">{job.experience}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-sm font-black uppercase">
                          {job.salary}
                        </span>
                        <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-200 rounded-sm font-black uppercase">
                          {job.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(job.tags || []).map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-white/10 border border-white/10 rounded-sm text-xs font-bold uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {job.signals?.length ? (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.signals.map((signal) => (
                            <span key={signal} className="px-2 py-1 bg-amber-500/10 border border-amber-400/40 text-amber-200 rounded-sm text-xs font-semibold">
                              {signal}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex gap-4">
                        <motion.button
                          onClick={() => openJobLink(job.jobUrl)}
                          className="flex-1 bg-primary-600 text-white py-3 rounded-sm font-black text-lg hover:bg-primary-700 transition"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          APPLY NOW
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            handleJobCompareChange('jobTitle', job.title);
                            handleJobCompareChange('company', job.company);
                            showToast('Prefilled the comparator – paste the job description to analyze!');
                          }}
                          className="px-6 border-2 border-white/20 text-white py-3 rounded-sm font-black text-lg hover:bg-white/10 transition"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          COMPARE JD
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="bg-white/5 border border-dashed border-white/20 p-12 rounded-sm text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-lg text-gray-400">
                      No live feeds yet. Complete your assessment or try refreshing the dashboard.
                    </p>
                  </motion.div>
                )}
              </div>

              <motion.div
                className="bg-white/5 border border-white/10 p-8 rounded-sm h-fit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Gauge className="w-6 h-6 text-primary-400" />
                  <h3 className="text-2xl font-black uppercase">JD Comparator</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">Paste any job description and we will highlight your matches & gaps.</p>
                <form onSubmit={handleJobComparison} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Job Title</label>
                    <input
                      type="text"
                      value={jobCompareForm.jobTitle}
                      onChange={(e) => handleJobCompareChange('jobTitle', e.target.value)}
                      className="mt-2 w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-white/40"
                      placeholder="e.g. Product Manager"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Company</label>
                    <input
                      type="text"
                      value={jobCompareForm.company}
                      onChange={(e) => handleJobCompareChange('company', e.target.value)}
                      className="mt-2 w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-white/40"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Job Description</label>
                    <textarea
                      value={jobCompareForm.jobDescription}
                      onChange={(e) => handleJobCompareChange('jobDescription', e.target.value)}
                      className="mt-2 w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-sm h-32 resize-none focus:outline-none focus:border-white/40"
                      placeholder="Paste the JD text here..."
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isComparingJob}
                    className="w-full bg-white text-black py-3 rounded-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isComparingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gauge className="w-4 h-4" />}
                    RUN COMPARISON
                  </motion.button>
                </form>
              </motion.div>
            </div>

            <motion.div
              className="bg-white/5 border border-white/10 p-8 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black uppercase">Recent AI Comparisons</h3>
                <span className="text-sm text-gray-400">{jobComparisons.length} saved</span>
              </div>
              <div className="space-y-4">
                {jobComparisons.length ? (
                  jobComparisons.map((comparison) => (
                    <div key={comparison.id} className="bg-black/40 border border-white/5 rounded-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-black">{comparison.jobTitle}</p>
                          <p className="text-gray-400 text-sm">{comparison.company ?? 'Unknown company'}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimestamp(comparison.createdAt)}</span>
                      </div>
                      {comparison.summary && (
                        <p className="text-sm text-gray-300">{comparison.summary}</p>
                      )}
                      {comparison.matches.length > 0 && (
                        <div className="text-sm text-green-400">
                          <span className="font-black uppercase mr-2">Matches</span>
                          {comparison.matches.slice(0, 2).join(', ')}
                        </div>
                      )}
                      {comparison.gaps.length > 0 && (
                        <div className="text-sm text-yellow-300">
                          <span className="font-black uppercase mr-2">Gaps</span>
                          {comparison.gaps.slice(0, 2).join(', ')}
                        </div>
                      )}
                      {comparison.fastTrack.length > 0 && (
                        <div className="text-sm text-blue-300">
                          <span className="font-black uppercase mr-2">Fast Track</span>
                          {comparison.fastTrack.slice(0, 2).join(', ')}
                        </div>
                      )}
                      {comparison.suggestions.length > 0 && (
                        <div className="text-xs text-gray-300">
                          {comparison.suggestions[0]}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Run your first JD comparison to see recommendations here.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            <motion.div
              className="bg-white/5 border border-white/10 p-12 rounded-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Users className="w-20 h-20 text-primary-500 mx-auto mb-6" />
              <h3 className="text-4xl font-black mb-4">COMMUNITY FEATURES</h3>
              <p className="text-gray-400 text-xl mb-8">
                Connect with peers, find mentors, and join learning groups
              </p>
              <motion.button
                onClick={() => showToast('🚀 Community features launching soon!')}
                className="bg-white text-black px-12 py-4 rounded-sm font-black text-lg hover:bg-gray-200 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                COMING SOON
              </motion.button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="bg-black/60 border border-white/5 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-14 h-14 bg-white/10 rounded-sm flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-black mb-2">Peer Learning Pods</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Join curated squads preparing for product roles together every week.
                </p>
                <motion.button
                  onClick={() => joinGroup('Full Stack Sprint')}
                  className="w-full border border-white/20 py-3 rounded-sm font-bold hover:bg-white/10 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  JOIN GROUP
                </motion.button>
              </motion.div>

              <motion.div
                className="bg-black/60 border border-white/5 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-14 h-14 bg-white/10 rounded-sm flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-black mb-2">Mentor Connect</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Get paired with industry mentors for mock interviews and resume reviews.
                </p>
                <motion.button
                  onClick={() => requestMentorship('Ananya Sharma')}
                  className="w-full border border-white/20 py-3 rounded-sm font-bold hover:bg-white/10 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  REQUEST MENTOR
                </motion.button>
              </motion.div>

              <motion.div
                className="bg-black/60 border border-white/5 p-8 rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-14 h-14 bg-white/10 rounded-sm flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-black mb-2">Career Hotline</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Speak with LakshPath advisors and top students for instant guidance.
                </p>
                <motion.button
                  onClick={() => connectWithStudent('LakshPath Squad')}
                  className="w-full border border-white/20 py-3 rounded-sm font-bold hover:bg-white/10 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CONNECT NOW
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const generateMockMicroCoach = (): MicroCoachPayload => ({
  quizResultId: 'demo-quiz',
  weakSkills: [
    { name: 'communication', score: 3 },
    { name: 'clinical reasoning', score: 2 },
    { name: 'documentation', score: 2 },
  ],
  heatmap: [
    { name: 'Communication', score: 3, sentiment: 'Needs sharper storytelling in patient updates.' },
    { name: 'Clinical Reasoning', score: 2, sentiment: 'Push differential diagnosis drills weekly.' },
    { name: 'Documentation', score: 2, sentiment: 'Tighten charting speed and accuracy.' },
  ],
  microTasks: [
    {
      skill: 'Communication',
      title: 'Patient Handover Loom',
      description: 'Record a 2-min handover summarizing diagnosis, plan, and next steps—focus on clarity.',
      resourceUrl: 'https://www.loom.com',
    },
    {
      skill: 'Clinical Reasoning',
      title: 'Case Deck Drill',
      description: 'Break down three sample cases and write decision trees for each differential.',
      resourceUrl: 'https://emcrit.org',
    },
    {
      skill: 'Documentation',
      title: 'SOAP Note Sprint',
      description: 'Time-box yourself to five SOAP notes using yesterday’s practice cases.',
      resourceUrl: 'https://www.nejm.org',
    },
  ],
  generatedAt: new Date().toISOString(),
});

export default DashboardNew;
