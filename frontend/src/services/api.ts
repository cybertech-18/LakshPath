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
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

export default api;
