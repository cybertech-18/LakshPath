import prisma from '../lib/prisma';
import { geminiService } from './geminiService';
import { AppError } from '../middleware/errorHandler';

// Learning Depth Levels
export enum LearningDepth {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Question Types
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CODING = 'coding',
  SHORT_ANSWER = 'short_answer',
  TRUE_FALSE = 'true_false'
}

// Learning Topics Categories
export const LEARNING_CATEGORIES = {
  PROGRAMMING: {
    name: 'Programming',
    topics: [
      'JavaScript Fundamentals',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'React',
      'Node.js',
      'Data Structures',
      'Algorithms',
      'Object-Oriented Programming',
      'Functional Programming',
      'Async Programming'
    ]
  },
  WEB_DEVELOPMENT: {
    name: 'Web Development',
    topics: [
      'HTML5',
      'CSS3',
      'Responsive Design',
      'Tailwind CSS',
      'REST APIs',
      'GraphQL',
      'Authentication',
      'State Management',
      'Web Performance',
      'Browser APIs'
    ]
  },
  DATABASES: {
    name: 'Databases',
    topics: [
      'SQL',
      'PostgreSQL',
      'MongoDB',
      'Database Design',
      'Indexing',
      'Query Optimization',
      'Transactions',
      'NoSQL vs SQL'
    ]
  },
  SYSTEM_DESIGN: {
    name: 'System Design',
    topics: [
      'Scalability',
      'Load Balancing',
      'Caching',
      'Database Sharding',
      'Microservices',
      'API Design',
      'Message Queues',
      'CDN'
    ]
  },
  COMPUTER_SCIENCE: {
    name: 'Computer Science',
    topics: [
      'Operating Systems',
      'Networks',
      'Compilers',
      'Computer Architecture',
      'Distributed Systems',
      'Concurrency',
      'Memory Management'
    ]
  }
};

// Interfaces
interface PersonalizedPathRequest {
  careerGoal: string;
  currentSkills: { name: string; level: number }[];
  targetSkills: { name: string; targetLevel: number }[];
  timeCommitment: string; // e.g., "10 hours/week"
  learningStyle: 'visual' | 'reading' | 'hands-on' | 'mixed';
}

interface PersonalizedPath {
  pathId: string;
  title: string;
  description: string;
  estimatedDuration: string;
  phases: LearningPhase[];
  milestones: Milestone[];
  prerequisites: string[];
  outcomes: string[];
}

interface LearningPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  skills: string[];
  topics: string[];
  resources: ResourceRecommendation[];
  projects: ProjectIdea[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  skills: string[];
  completionCriteria: string[];
}

interface ConceptExplanation {
  concept: string;
  depth: LearningDepth;
  summary: string;
  explanation: string;
  keyPoints: string[];
  examples: CodeExample[];
  analogies: string[];
  commonMistakes: string[];
  relatedConcepts: string[];
  practiceExercises: string[];
  furtherReading: string[];
}

interface CodeExample {
  title: string;
  code: string;
  language: string;
  explanation: string;
}

interface Quiz {
  quizId: string;
  topic: string;
  difficulty: LearningDepth;
  questions: Question[];
  estimatedTime: string;
  passingScore: number;
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string;
  hints: string[];
  points: number;
  topic: string;
}

interface AssessmentResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  detailedExplanation: string;
  strengthsIdentified: string[];
  areasToImprove: string[];
  recommendedTopics: string[];
  nextSteps: string[];
}

interface StudyPlan {
  planId: string;
  userId: string;
  startDate: string;
  endDate: string;
  dailySchedule: DailyStudyBlock[];
  weeklyGoals: WeeklyGoal[];
  adaptiveRecommendations: string[];
}

interface DailyStudyBlock {
  day: string;
  date: string;
  blocks: {
    time: string;
    duration: string;
    topic: string;
    activity: string;
    resources: string[];
  }[];
}

interface WeeklyGoal {
  weekNumber: number;
  goals: string[];
  skills: string[];
  projects: string[];
  checkpoints: string[];
}

interface ResourceRecommendation {
  title: string;
  type: 'video' | 'article' | 'course' | 'book' | 'tutorial' | 'documentation';
  url?: string;
  platform: string;
  duration: string;
  difficulty: LearningDepth;
  rating?: number;
  cost: 'free' | 'paid';
  aiReasoning: string;
  relevanceScore: number;
}

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: LearningDepth;
  estimatedTime: string;
  skills: string[];
  features: string[];
}

interface LearningInsights {
  overallProgress: number;
  strengthAreas: { skill: string; score: number; trend: string }[];
  improvementAreas: { skill: string; gap: number; suggestions: string[] }[];
  studyPatterns: {
    averageStudyTime: string;
    mostProductiveTime: string;
    consistencyScore: number;
    streakDays: number;
  };
  learningVelocity: {
    conceptsLearnedPerWeek: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    comparison: string;
  };
  recommendations: string[];
  motivationalInsights: string[];
}

interface NextAction {
  priority: 'high' | 'medium' | 'low';
  action: string;
  reasoning: string;
  estimatedTime: string;
  expectedOutcome: string;
  resources: ResourceRecommendation[];
}

class LearningEnhancedService {
  /**
   * Generate personalized learning path based on user's goals and current skills
   */
  async generatePersonalizedPath(
    userId: string,
    request: PersonalizedPathRequest
  ): Promise<PersonalizedPath> {
    try {
      // Get user's profile for context
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate personalized path
      const result = await geminiService.generateLearningPath({
        userId,
        careerGoal: request.careerGoal,
        currentSkills: request.currentSkills,
        targetSkills: request.targetSkills,
        timeCommitment: request.timeCommitment,
        learningStyle: request.learningStyle,
        userContext: user.quizResults[0] || {}
      });

      return result.parsed;
    } catch (error) {
      console.error('Error generating personalized path:', error);
      throw new AppError('Failed to generate learning path', 500);
    }
  }

  /**
   * Explain a concept with specified depth level
   */
  async explainConcept(
    userId: string,
    concept: string,
    depth: LearningDepth,
    context?: string
  ): Promise<ConceptExplanation> {
    try {
      // Get user's learning history for personalization
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate concept explanation
      const result = await geminiService.explainConceptWithDepth({
        concept,
        depth,
        context,
        userId
      });

      return result.parsed;
    } catch (error) {
      console.error('Error explaining concept:', error);
      throw new AppError('Failed to explain concept', 500);
    }
  }

  /**
   * Generate practice questions/quiz on a topic
   */
  async generatePracticeQuestions(
    userId: string,
    topic: string,
    difficulty: LearningDepth,
    questionCount: number,
    types: QuestionType[]
  ): Promise<Quiz> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate quiz
      const result = await geminiService.generateQuiz({
        topic,
        difficulty,
        questionCount,
        types,
        userId
      });

      return result.parsed;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new AppError('Failed to generate quiz', 500);
    }
  }

  /**
   * Assess user's answer and provide detailed feedback
   */
  async assessUnderstanding(
    userId: string,
    questionId: string,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    topic: string
  ): Promise<AssessmentResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to evaluate answer
      const assessment = await geminiService.evaluateLearningAnswer({
        questionId,
        question,
        userAnswer,
        correctAnswer,
        topic,
        userId
      });

      return assessment.parsed;
    } catch (error) {
      console.error('Error assessing understanding:', error);
      throw new AppError('Failed to assess understanding', 500);
    }
  }

  /**
   * Generate structured study plan
   */
  async getStudyPlan(
    userId: string,
    durationWeeks: number,
    hoursPerWeek: number,
    focusAreas: string[]
  ): Promise<StudyPlan> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate study plan
      const result = await geminiService.generateStudyPlan({
        userId,
        durationWeeks,
        hoursPerWeek,
        focusAreas,
        userContext: user.quizResults[0] || {}
      });

      return result.parsed;
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new AppError('Failed to generate study plan', 500);
    }
  }

  /**
   * Get AI-powered resource recommendations
   */
  async getResourceRecommendations(
    userId: string,
    topic: string,
    learningStyle: string,
    currentLevel: LearningDepth,
    preferences: {
      costPreference: 'free' | 'paid' | 'any';
      duration: 'short' | 'medium' | 'long';
      types: string[];
    }
  ): Promise<ResourceRecommendation[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to recommend resources
      const result = await geminiService.recommendResources({
        userId,
        topic,
        learningStyle,
        currentLevel,
        preferences
      });

      return result.parsed;
    } catch (error) {
      console.error('Error getting resource recommendations:', error);
      throw new AppError('Failed to get recommendations', 500);
    }
  }

  /**
   * Analyze learning progress and provide insights
   */
  async analyzeLearningProgress(userId: string): Promise<LearningInsights> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' }
          },
          interviewSessions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to analyze progress
      const result = await geminiService.analyzeProgressInsights({
        userId,
        quizResults: user.quizResults,
        interviewSessions: user.interviewSessions,
        userProfile: {
          createdAt: user.createdAt,
          email: user.email || ''
        }
      });

      return result.parsed;
    } catch (error) {
      console.error('Error analyzing learning progress:', error);
      throw new AppError('Failed to analyze progress', 500);
    }
  }

  /**
   * Get next best action recommendation
   */
  async getNextBestAction(userId: string): Promise<NextAction> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get learning insights first
      const insights = await this.analyzeLearningProgress(userId);

      // Determine next best action based on insights
      const nextAction: NextAction = {
        priority: 'high',
        action: '',
        reasoning: '',
        estimatedTime: '',
        expectedOutcome: '',
        resources: []
      };

      // Use AI to recommend next action
      if (insights.improvementAreas.length > 0) {
        const topWeakArea = insights.improvementAreas[0];
        nextAction.action = `Focus on improving ${topWeakArea.skill}`;
        nextAction.reasoning = `This is your weakest area with a gap of ${topWeakArea.gap}. Addressing this will have the highest impact on your overall progress.`;
        nextAction.estimatedTime = '2-3 hours';
        nextAction.expectedOutcome = `Improve ${topWeakArea.skill} proficiency by 20-30%`;
        
        // Get resources for this skill
        nextAction.resources = await this.getResourceRecommendations(
          userId,
          topWeakArea.skill,
          'mixed',
          LearningDepth.INTERMEDIATE,
          {
            costPreference: 'any',
            duration: 'medium',
            types: ['video', 'tutorial', 'article']
          }
        );
      } else if (insights.strengthAreas.length > 0) {
        const topStrength = insights.strengthAreas[0];
        nextAction.action = `Build a project using ${topStrength.skill}`;
        nextAction.reasoning = `You're performing well in ${topStrength.skill}. Solidify your knowledge by building something practical.`;
        nextAction.estimatedTime = '5-10 hours';
        nextAction.expectedOutcome = `Apply ${topStrength.skill} skills in real-world scenarios`;
        nextAction.priority = 'medium';
      } else {
        nextAction.action = 'Complete your initial skills assessment';
        nextAction.reasoning = 'We need to understand your current skill levels to provide personalized recommendations.';
        nextAction.estimatedTime = '30 minutes';
        nextAction.expectedOutcome = 'Get personalized learning path based on your skills';
      }

      return nextAction;
    } catch (error) {
      console.error('Error getting next best action:', error);
      throw new AppError('Failed to get next action', 500);
    }
  }

  /**
   * Get learning categories and topics
   */
  getLearningCategories() {
    return LEARNING_CATEGORIES;
  }
}

export default new LearningEnhancedService();
export {
  PersonalizedPathRequest,
  PersonalizedPath,
  LearningPhase,
  Milestone,
  ConceptExplanation,
  Quiz,
  Question,
  AssessmentResult,
  StudyPlan,
  ResourceRecommendation,
  LearningInsights,
  NextAction
};
