import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import { AppError } from '@middleware/errorHandler';

// Question categories with structured data
export const QUESTION_CATEGORIES = {
  ARRAYS: {
    name: 'Arrays & Strings',
    topics: ['Two Pointers', 'Sliding Window', 'Hash Maps', 'Prefix Sum'],
    icon: '📊',
  },
  ALGORITHMS: {
    name: 'Algorithms',
    topics: ['Sorting', 'Searching', 'Recursion', 'Dynamic Programming'],
    icon: '🔄',
  },
  DATA_STRUCTURES: {
    name: 'Data Structures',
    topics: ['Linked Lists', 'Trees', 'Graphs', 'Heaps', 'Stacks', 'Queues'],
    icon: '🌳',
  },
  SYSTEM_DESIGN: {
    name: 'System Design',
    topics: ['Scalability', 'Databases', 'Caching', 'Load Balancing', 'Microservices'],
    icon: '🏗️',
  },
  BEHAVIORAL: {
    name: 'Behavioral',
    topics: ['Leadership', 'Conflict Resolution', 'Problem Solving', 'Teamwork'],
    icon: '💬',
  },
  CONCURRENCY: {
    name: 'Concurrency',
    topics: ['Threading', 'Async/Await', 'Race Conditions', 'Deadlocks'],
    icon: '⚡',
  },
};

export interface HintLevel {
  level: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  content: string;
}

export interface CodeReviewRequest {
  sessionId: string;
  questionId: string;
  code: string;
  language: string;
}

export interface CodeReviewResponse {
  overallScore: number; // 0-100
  issues: Array<{
    type: 'bug' | 'performance' | 'style' | 'logic' | 'security';
    severity: 'low' | 'medium' | 'high' | 'critical';
    line?: number;
    message: string;
    suggestion: string;
  }>;
  suggestions: string[];
  complexity: {
    time: string;
    space: string;
    explanation: string;
  };
  interviewerFeedback: string;
  strengths: string[];
  improvements: string[];
}

export interface FollowUpQuestionsRequest {
  sessionId: string;
  questionId: string;
  code: string;
  userAnswer: string;
}

export interface FollowUpQuestion {
  question: string;
  purpose: string; // Why this question is being asked
  expectedTopics: string[];
}

export const interviewEnhancedService = {
  /**
   * Get AI-powered code review
   */
  async getCodeReview(request: CodeReviewRequest, userId: string): Promise<CodeReviewResponse> {
    // Verify session belongs to user
    const session = await prisma.interviewSession.findUnique({
      where: { id: request.sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const question = await prisma.interviewQuestion.findUnique({
      where: { id: request.questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Use Gemini to analyze code
    const result = await geminiService.reviewCode(request.code, question.questionText, request.language);
    return result.parsed;
  },

  /**
   * Get context-aware hints (4 levels)
   */
  async getHint(
    questionId: string,
    userId: string,
    hintLevel: 1 | 2 | 3 | 4,
    currentCode?: string
  ): Promise<HintLevel> {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: { session: true },
    });

    if (!question || question.session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const hintLevelDescriptions = {
      1: {
        title: 'Subtle Nudge',
        description: 'A gentle push in the right direction',
      },
      2: {
        title: 'Concept Hint',
        description: 'Key concept or approach to consider',
      },
      3: {
        title: 'Detailed Guidance',
        description: 'Step-by-step approach outline',
      },
      4: {
        title: 'Complete Explanation',
        description: 'Full solution explanation with code structure',
      },
    };

    const result = await geminiService.generateHint(question.questionText, hintLevel, currentCode);
    const hintData = result.parsed;

    return {
      level: hintLevel,
      title: hintLevelDescriptions[hintLevel].title,
      description: hintLevelDescriptions[hintLevel].description,
      content: hintData.content,
    };
  },

  /**
   * Generate follow-up interview questions based on user's solution
   */
  async getFollowUpQuestions(
    request: FollowUpQuestionsRequest,
    userId: string
  ): Promise<FollowUpQuestion[]> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: request.sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const question = await prisma.interviewQuestion.findUnique({
      where: { id: request.questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const result = await geminiService.generateFollowUpQuestions(
      question.questionText,
      request.userAnswer,
      request.code
    );
    const followUps = result.parsed;
    return followUps;
  },

  /**
   * Get category-based questions
   */
  async getQuestionsByCategory(
    category: keyof typeof QUESTION_CATEGORIES,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    limit = 10
  ) {
    const categoryInfo = QUESTION_CATEGORIES[category];

    // Generate questions using AI
    const result = await geminiService.generateInterviewQuestions({
      type: 'CODING',
      difficulty,
      role: categoryInfo.name,
      count: limit,
    });

    return result.parsed.questions;
  },

  /**
   * Analyze interview performance across sessions
   */
  async getPerformanceAnalytics(userId: string) {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      include: {
        questions: {
          select: {
            questionType: true,
            difficulty: true,
            answerScore: true,
            timeTaken: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const analytics = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter((s) => s.status === 'COMPLETED').length,
      averageScore: 0,
      strengthAreas: [] as string[],
      improvementAreas: [] as string[],
      timeManagement: {
        averageTimePerQuestion: 0,
        fastestQuestion: 0,
        slowestQuestion: 0,
      },
      performanceByType: {} as Record<string, { avgScore: number; count: number }>,
      performanceByDifficulty: {} as Record<string, { avgScore: number; count: number }>,
      recentTrend: 'improving' as 'improving' | 'declining' | 'stable',
    };

    // Calculate metrics
    let totalQuestions = 0;
    let totalScore = 0;
    let totalTime = 0;
    let questionCount = 0;

    const typeScores: Record<string, number[]> = {};
    const difficultyScores: Record<string, number[]> = {};

    sessions.forEach((session) => {
      session.questions.forEach((q) => {
        if (q.answerScore !== null) {
          totalQuestions++;
          totalScore += q.answerScore;

          if (q.timeTaken) {
            totalTime += q.timeTaken;
            questionCount++;
          }

          // By type
          if (!typeScores[q.questionType]) typeScores[q.questionType] = [];
          typeScores[q.questionType].push(q.answerScore);

          // By difficulty
          if (!difficultyScores[q.difficulty]) difficultyScores[q.difficulty] = [];
          difficultyScores[q.difficulty].push(q.answerScore);
        }
      });
    });

    analytics.averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
    analytics.timeManagement.averageTimePerQuestion =
      questionCount > 0 ? totalTime / questionCount : 0;

    // Performance by type
    Object.entries(typeScores).forEach(([type, scores]) => {
      analytics.performanceByType[type] = {
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
      };
    });

    // Performance by difficulty
    Object.entries(difficultyScores).forEach(([difficulty, scores]) => {
      analytics.performanceByDifficulty[difficulty] = {
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
      };
    });

    // Identify strengths and improvements
    const sortedTypes = Object.entries(analytics.performanceByType).sort(
      ([, a], [, b]) => b.avgScore - a.avgScore
    );

    analytics.strengthAreas = sortedTypes
      .slice(0, 2)
      .map(([type]) => type)
      .filter((_, i, arr) => arr.length > 1 || i === 0);

    analytics.improvementAreas = sortedTypes
      .slice(-2)
      .map(([type]) => type)
      .filter((_, i, arr) => arr.length > 1 || i === 0);

    // Calculate trend (compare last 5 vs previous 5 sessions)
    if (sessions.length >= 10) {
      const recentSessions = sessions.slice(0, 5);
      const oldSessions = sessions.slice(5, 10);

      const recentAvg =
        recentSessions.reduce((sum, s) => {
          const sessionScore =
            s.questions.reduce((qSum, q) => qSum + (q.answerScore || 0), 0) /
            (s.questions.length || 1);
          return sum + sessionScore;
        }, 0) / recentSessions.length;

      const oldAvg =
        oldSessions.reduce((sum, s) => {
          const sessionScore =
            s.questions.reduce((qSum, q) => qSum + (q.answerScore || 0), 0) /
            (s.questions.length || 1);
          return sum + sessionScore;
        }, 0) / oldSessions.length;

      if (recentAvg > oldAvg + 5) analytics.recentTrend = 'improving';
      else if (recentAvg < oldAvg - 5) analytics.recentTrend = 'declining';
      else analytics.recentTrend = 'stable';
    }

    return analytics;
  },
};
