import axios from 'axios';

export interface AssessmentSubmitPayload {
  answers: Record<string, any>;
  demo?: boolean;
  profile?: {
    name?: string;
    education?: string;
    interests?: string[];
  };
  user?: {
    id?: string;
    email?: string;
    name?: string;
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

export interface UserProfileSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  profile: UserProfileSummary;
  latestAssessment: {
    id: string;
    createdAt: string;
    summary: Record<string, unknown> | null;
    strengths: Record<string, unknown> | null;
    weaknesses: Record<string, unknown> | null;
  } | null;
  activeRoadmap: {
    id: string;
    title: string;
    summary: string | null;
    duration: string | null;
    createdAt: string;
  } | null;
}

export interface UserProgressResponse {
  stats: {
    assessmentsCompleted: number;
    insightsGenerated: number;
    jobsCompared: number;
    milestones: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.5:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),

  googleLogin: (credential: string) =>
    api.post('/auth/google', { credential }),

  demoLogin: () => api.post('/auth/demo'),
};

// Assessment API calls
export const assessmentAPI = {
  submit: (payload: AssessmentSubmitPayload) =>
    api.post('/assessment', payload),
  
  getResults: (userId?: string | null) => {
    if (!userId || userId === 'me') {
      return api.get('/assessment/me');
    }
    return api.get(`/assessment/${userId}`);
  },

  generateMicroCoach: (userId: string) =>
    api.post(`/assessment/${userId}/micro-tasks`),
};

// Career API calls
export const careerAPI = {
  getMatches: () => api.get('/careers/matches'),
  
  getCareerDetails: (careerId: string) =>
    api.get(`/careers/${careerId}`),
};

// Roadmap API calls
export const roadmapAPI = {
  getActive: () => api.get('/roadmap/active'),
  
  generate: (careerId: string) =>
    api.post('/roadmap/generate', { careerId }),
  
  updateProgress: (milestoneId: string, completed: boolean) =>
    api.patch(`/roadmap/milestone/${milestoneId}`, { completed }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get<UserProfileResponse>('/user/profile'),
  
  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    api.patch<{ profile: UserProfileSummary }>('/user/profile', data),
  
  getProgress: () => api.get<UserProgressResponse>('/user/progress'),
};

// Market intelligence API
export const marketAPI = {
  getBrief: () => api.get('/market/brief'),
};

// Jobs API
export const jobsAPI = {
  list: () => api.get('/jobs/list'),
  compare: (payload: { userId: string; jobTitle: string; company?: string; jobDescription: string }) =>
    api.post('/jobs/compare', payload),
  comparisons: (userId: string) => api.get(`/jobs/comparisons/${userId}`),
  autoScout: (userId: string, params?: { domain?: string; limit?: number; refresh?: boolean }) =>
    api.get(`/jobs/auto-scout/${userId}`, { params }),
};

// AI insights API
export const insightsAPI = {
  list: (userId: string) => api.get(`/insights/${userId}`),
};

// Mentor chat API
export const chatAPI = {
  mentorRound: (payload: { userId: string; message: string; round?: 'career' | 'interview' | 'scholarship'; context?: Record<string, unknown>; }) =>
    api.post<{ reply: MentorChatResponse }>('/chat/mentor', payload),
};

// Interview Practice API
export const interviewAPI = {
  startSession: (type: string, difficulty: string, role?: string) =>
    api.post('/interview/start', { type, difficulty, role }),
  
  submitAnswer: (questionId: string, answer: string, timeTaken?: number) =>
    api.post('/interview/answer', { questionId, answer, timeTaken }),
  
  completeSession: (sessionId: string, speechTranscript?: string) =>
    api.post(`/interview/${sessionId}/complete`, { speechTranscript }),
  
  getSession: (sessionId: string) =>
    api.get(`/interview/${sessionId}`),
  
  getNextQuestion: (sessionId: string) =>
    api.get(`/interview/${sessionId}/next`),
  
  getSessions: (limit?: number) =>
    api.get('/interview/sessions', { params: { limit } }),
  
  getStats: () =>
    api.get('/interview/stats'),
};

// Portfolio Analysis API
export const portfolioAPI = {
  analyzeGitHub: (githubUsername: string, targetRole?: string) =>
    api.post('/portfolio/analyze', { githubUsername, targetRole }),
  
  getAnalysis: (analysisId: string) =>
    api.get(`/portfolio/${analysisId}`),
  
  getAnalyses: (limit?: number) =>
    api.get('/portfolio/analyses', { params: { limit } }),
  
  getStats: () =>
    api.get('/portfolio/stats'),
  
  deleteAnalysis: (analysisId: string) =>
    api.delete(`/portfolio/${analysisId}`),
};

// Enhanced Interview Practice API
export const interviewEnhancedAPI = {
  // Get question categories
  getCategories: () =>
    api.get('/interview-enhanced/categories'),
  
  // Get AI code review
  getCodeReview: (data: {
    sessionId: string;
    questionId: string;
    code: string;
    language: string;
  }) =>
    api.post('/interview-enhanced/code-review', data),
  
  // Get progressive hint (Levels 1-4)
  getHint: (data: {
    questionId: string;
    hintLevel: 1 | 2 | 3 | 4;
    currentCode?: string;
  }) =>
    api.post('/interview-enhanced/hint', data),
  
  // Get follow-up interview questions
  getFollowUpQuestions: (data: {
    sessionId: string;
    questionId: string;
    code: string;
    userAnswer: string;
  }) =>
    api.post('/interview-enhanced/follow-up-questions', data),
  
  // Get questions by category
  getQuestionsByCategory: (category: string, difficulty: string = 'MEDIUM', limit: number = 10) =>
    api.get(`/interview-enhanced/questions/category/${category}`, {
      params: { difficulty, limit }
    }),
  
  // Get performance analytics
  getAnalytics: () =>
    api.get('/interview-enhanced/analytics'),
};

// Enhanced Learning API
export const learningEnhancedAPI = {
  // Generate personalized learning path
  generatePath: (data: {
    careerGoal: string;
    currentSkills: Array<{ name: string; level: number }>;
    targetSkills: Array<{ name: string; targetLevel: number }>;
    timeCommitment: string;
    learningStyle: 'visual' | 'reading' | 'hands-on' | 'mixed';
  }) =>
    api.post('/learning-enhanced/path', data),
  
  // Explain concept at specified depth
  explainConcept: (data: {
    concept: string;
    depth: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    context?: string;
  }) =>
    api.post('/learning-enhanced/explain', data),
  
  // Generate practice quiz
  generateQuiz: (data: {
    topic: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    questionCount: number;
    types: Array<'multiple_choice' | 'coding' | 'short_answer' | 'true_false'>;
  }) =>
    api.post('/learning-enhanced/quiz', data),
  
  // Assess quiz answer
  assessAnswer: (data: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
  }) =>
    api.post('/learning-enhanced/assess', data),
  
  // Generate study plan
  getStudyPlan: (data: {
    durationWeeks: number;
    hoursPerWeek: number;
    focusAreas: string[];
  }) =>
    api.post('/learning-enhanced/study-plan', data),
  
  // Get resource recommendations
  getRecommendations: (data: {
    topic: string;
    learningStyle: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferences: {
      costPreference: 'free' | 'paid' | 'any';
      duration: 'short' | 'medium' | 'long';
      types: string[];
    };
  }) =>
    api.post('/learning-enhanced/recommendations', data),
  
  // Get learning progress insights
  getInsights: () =>
    api.get('/learning-enhanced/insights'),
  
  // Get next best action
  getNextAction: () =>
    api.get('/learning-enhanced/next-action'),
  
  // Get learning categories
  getCategories: () =>
    api.get('/learning-enhanced/categories'),
};

// NSQF Pathway API (Inspired by ShikshaDisha)
export const nsqfAPI = {
  // Generate NSQF-aligned vocational pathway
  generatePathway: (profile: {
    currentEducationLevel: string;
    currentNSQFLevel: number;
    targetNSQFLevel: number;
    interests: string[];
    skills: string[];
    location: string;
    preferredLanguage: string;
    experienceYears: number;
    learningMode: 'online' | 'offline' | 'hybrid';
    budget: 'free' | 'low' | 'medium' | 'high';
  }) =>
    api.post('/nsqf/pathway/generate', profile),
  
  // Predict employability for target sector
  predictEmployability: (data: {
    profile: {
      currentNSQFLevel: number;
      targetNSQFLevel: number;
      skills: string[];
      experienceYears: number;
      location: string;
    };
    targetSector: string;
  }) =>
    api.post('/nsqf/employability/predict', data),
  
  // Analyze skill gap for target role
  analyzeSkillGap: (data: {
    currentSkills: string[];
    targetRole: string;
    targetSector: string;
  }) =>
    api.post('/nsqf/skill-gap/analyze', data),
  
  // Get NSQF course recommendations
  recommendCourses: (data: {
    profile: {
      currentNSQFLevel: number;
      targetNSQFLevel: number;
      interests: string[];
      skills: string[];
      location: string;
      learningMode: 'online' | 'offline' | 'hybrid';
      budget: 'free' | 'low' | 'medium' | 'high';
      preferredLanguage: string;
    };
    limit?: number;
  }) =>
    api.post('/nsqf/courses/recommend', data),
  
  // Get career progression forecast (3-5 years)
  forecastCareer: (data: {
    profile: {
      currentNSQFLevel: number;
      skills: string[];
      experienceYears: number;
      location: string;
    };
    targetSector: string;
    yearsAhead?: number;
  }) =>
    api.post('/nsqf/career/forecast', data),
  
  // Get applicable government schemes (PMKVY, NAPS, DDU-GKY, etc.)
  getSchemes: (profile: {
    currentEducationLevel: string;
    currentNSQFLevel: number;
    interests: string[];
    location: string;
    experienceYears: number;
  }) =>
    api.post('/nsqf/schemes/applicable', { profile }),
  
  // Analyze transferable skills for career transition
  analyzeTransferableSkills: (data: {
    currentSector: string;
    targetSector: string;
    currentSkills: string[];
  }) =>
    api.post('/nsqf/skills/transferable', data),
  
  // Get all vocational sectors
  getSectors: () =>
    api.get('/nsqf/sectors'),
  
  // Get NSQF level information (1-10)
  getLevelInfo: (level: number) =>
    api.get(`/nsqf/level/${level}`),
};


export default api;
