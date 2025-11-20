import { Router, Request, Response, NextFunction } from 'express';
import learningEnhancedService, { LearningDepth, QuestionType } from '../services/learningEnhancedService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/learning-enhanced/path
 * Generate personalized learning path based on user's career goal and skills
 * 
 * Body:
 * {
 *   "careerGoal": "Full Stack Developer",
 *   "currentSkills": [{ "name": "JavaScript", "level": 6 }],
 *   "targetSkills": [{ "name": "React", "targetLevel": 9 }],
 *   "timeCommitment": "10 hours/week",
 *   "learningStyle": "visual" | "reading" | "hands-on" | "mixed"
 * }
 */
router.post('/path', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      careerGoal,
      currentSkills,
      targetSkills,
      timeCommitment,
      learningStyle
    } = req.body;

    if (!careerGoal || !currentSkills || !targetSkills || !timeCommitment || !learningStyle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: careerGoal, currentSkills, targetSkills, timeCommitment, learningStyle'
      });
    }

    const path = await learningEnhancedService.generatePersonalizedPath(userId, {
      careerGoal,
      currentSkills,
      targetSkills,
      timeCommitment,
      learningStyle
    });

    res.json({
      success: true,
      data: path
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning-enhanced/explain
 * Get AI explanation of a concept at specified depth level
 * 
 * Body:
 * {
 *   "concept": "Closure in JavaScript",
 *   "depth": "beginner" | "intermediate" | "advanced" | "expert",
 *   "context": "Optional context about what you're trying to learn"
 * }
 */
router.post('/explain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { concept, depth, context } = req.body;

    if (!concept || !depth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: concept, depth'
      });
    }

    if (!Object.values(LearningDepth).includes(depth)) {
      return res.status(400).json({
        success: false,
        message: `Invalid depth. Must be one of: ${Object.values(LearningDepth).join(', ')}`
      });
    }

    const explanation = await learningEnhancedService.explainConcept(
      userId,
      concept,
      depth as LearningDepth,
      context
    );

    res.json({
      success: true,
      data: explanation
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning-enhanced/quiz
 * Generate practice quiz on a topic
 * 
 * Body:
 * {
 *   "topic": "React Hooks",
 *   "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
 *   "questionCount": 5,
 *   "types": ["multiple_choice", "coding", "short_answer", "true_false"]
 * }
 */
router.post('/quiz', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { topic, difficulty, questionCount, types } = req.body;

    if (!topic || !difficulty || !questionCount || !types) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: topic, difficulty, questionCount, types'
      });
    }

    if (!Object.values(LearningDepth).includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty. Must be one of: ${Object.values(LearningDepth).join(', ')}`
      });
    }

    // Validate types
    const validTypes = Object.values(QuestionType);
    const invalidTypes = types.filter((t: string) => !validTypes.includes(t as QuestionType));
    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid question types: ${invalidTypes.join(', ')}. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const quiz = await learningEnhancedService.generatePracticeQuestions(
      userId,
      topic,
      difficulty as LearningDepth,
      questionCount,
      types as QuestionType[]
    );

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning-enhanced/assess
 * Assess user's answer to a question with detailed feedback
 * 
 * Body:
 * {
 *   "questionId": "q1",
 *   "question": "What is a closure?",
 *   "userAnswer": "A function that has access to variables from outer scope",
 *   "correctAnswer": "A closure is a function bundled with references to its surrounding state",
 *   "topic": "JavaScript Fundamentals"
 * }
 */
router.post('/assess', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { questionId, question, userAnswer, correctAnswer, topic } = req.body;

    if (!questionId || !question || !userAnswer || !correctAnswer || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: questionId, question, userAnswer, correctAnswer, topic'
      });
    }

    const result = await learningEnhancedService.assessUnderstanding(
      userId,
      questionId,
      question,
      userAnswer,
      correctAnswer,
      topic
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning-enhanced/study-plan
 * Generate structured study plan
 * 
 * Body:
 * {
 *   "durationWeeks": 12,
 *   "hoursPerWeek": 10,
 *   "focusAreas": ["React", "Node.js", "TypeScript"]
 * }
 */
router.post('/study-plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { durationWeeks, hoursPerWeek, focusAreas } = req.body;

    if (!durationWeeks || !hoursPerWeek || !focusAreas) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: durationWeeks, hoursPerWeek, focusAreas'
      });
    }

    if (durationWeeks < 1 || durationWeeks > 52) {
      return res.status(400).json({
        success: false,
        message: 'durationWeeks must be between 1 and 52'
      });
    }

    if (hoursPerWeek < 1 || hoursPerWeek > 60) {
      return res.status(400).json({
        success: false,
        message: 'hoursPerWeek must be between 1 and 60'
      });
    }

    const plan = await learningEnhancedService.getStudyPlan(
      userId,
      durationWeeks,
      hoursPerWeek,
      focusAreas
    );

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning-enhanced/recommendations
 * Get AI-powered resource recommendations
 * 
 * Body:
 * {
 *   "topic": "System Design",
 *   "learningStyle": "visual" | "reading" | "hands-on" | "mixed",
 *   "currentLevel": "beginner" | "intermediate" | "advanced" | "expert",
 *   "preferences": {
 *     "costPreference": "free" | "paid" | "any",
 *     "duration": "short" | "medium" | "long",
 *     "types": ["video", "article", "course", "book", "tutorial", "documentation"]
 *   }
 * }
 */
router.post('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { topic, learningStyle, currentLevel, preferences } = req.body;

    if (!topic || !learningStyle || !currentLevel || !preferences) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: topic, learningStyle, currentLevel, preferences'
      });
    }

    if (!Object.values(LearningDepth).includes(currentLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid currentLevel. Must be one of: ${Object.values(LearningDepth).join(', ')}`
      });
    }

    const resources = await learningEnhancedService.getResourceRecommendations(
      userId,
      topic,
      learningStyle,
      currentLevel as LearningDepth,
      preferences
    );

    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning-enhanced/insights
 * Get comprehensive learning progress insights
 */
router.get('/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const insights = await learningEnhancedService.analyzeLearningProgress(userId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning-enhanced/next-action
 * Get AI recommendation for next best learning action
 */
router.get('/next-action', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const nextAction = await learningEnhancedService.getNextBestAction(userId);

    res.json({
      success: true,
      data: nextAction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning-enhanced/categories
 * Get all available learning categories and topics
 */
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = learningEnhancedService.getLearningCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

export default router;
