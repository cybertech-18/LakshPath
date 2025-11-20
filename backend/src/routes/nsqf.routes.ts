import { Router, type RequestHandler } from 'express';
import nsqfPathwayService, { NSQFProfile } from '../services/nsqfPathwayService';
import { attachUserIfPresent } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/nsqf/pathway/generate
 * Generate personalized NSQF vocational pathway
 */
const generatePathway: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo-user';

    const profile: NSQFProfile = req.body;
    
    // Validate required fields
    if (!profile.currentEducationLevel || !profile.currentNSQFLevel || !profile.targetNSQFLevel) {
      throw new AppError('Missing required profile fields', 400);
    }

    const pathway = await nsqfPathwayService.generateVocationalPathway(userId, profile);
    
    res.json({
      success: true,
      data: pathway
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nsqf/employability/predict
 * Predict employability for target sector
 */
const predictEmployability: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo-user';

    const { profile, targetSector } = req.body;
    
    if (!profile || !targetSector) {
      throw new AppError('Profile and targetSector are required', 400);
    }

    const prediction = await nsqfPathwayService.predictEmployability(
      userId,
      profile,
      targetSector
    );
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nsqf/skill-gap/analyze
 * Analyze skill gap for target role
 */
const analyzeSkillGap: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo-user';

    const { currentSkills, targetRole, targetSector } = req.body;
    
    if (!currentSkills || !targetRole || !targetSector) {
      throw new AppError('currentSkills, targetRole, and targetSector are required', 400);
    }

    const analysis = await nsqfPathwayService.analyzeSkillGap(
      userId,
      currentSkills,
      targetRole,
      targetSector
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nsqf/courses/recommend
 * Get NSQF course recommendations
 */
const recommendCourses: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo-user';

    const { profile, preferences } = req.body;
    
    if (!profile) {
      throw new AppError('Profile is required', 400);
    }

    const limit = preferences?.limit || 10;
    const courses = await nsqfPathwayService.getRecommendedCourses(
      userId,
      profile,
      limit
    );
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nsqf/career/forecast
 * Get career progression forecast
 */
const forecastCareer: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { profile, targetSector, yearsAhead = 5 } = req.body;
    
    if (!profile || !targetSector) {
      throw new AppError('Profile and targetSector are required', 400);
    }

    const forecast = await nsqfPathwayService.getCareerForecast(
      userId,
      profile,
      targetSector,
      yearsAhead
    );
    
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nsqf/schemes/applicable
 * Get applicable government schemes
 */
const getSchemes: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { profile } = req.body;
    
    if (!profile) {
      throw new AppError('Profile is required', 400);
    }

    const schemes = await nsqfPathwayService.getGovernmentSchemes(userId, profile);
    
    res.json({
      success: true,
      data: schemes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nsqf/skills/transferable
 * Identify transferable skills for career transition
 */
const analyzeTransferableSkills: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { currentSector, targetSector, currentSkills } = req.body;
    
    if (!currentSector || !targetSector || !currentSkills) {
      throw new AppError('currentSector, targetSector, and currentSkills are required', 400);
    }

    const analysis = await nsqfPathwayService.identifyTransferableSkills(
      userId,
      currentSector,
      targetSector,
      currentSkills
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/nsqf/sectors
 * Get all vocational sectors
 */
const getSectors: RequestHandler = async (req, res, next) => {
  try {
    const sectors = nsqfPathwayService.getVocationalSectors();
    
    res.json({
      success: true,
      data: sectors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/nsqf/level/:level
 * Get NSQF level information
 */
const getLevelInfo: RequestHandler = async (req, res, next) => {
  try {
    const level = parseInt(req.params.level);
    
    if (isNaN(level) || level < 1 || level > 10) {
      throw new AppError('Invalid NSQF level. Must be between 1 and 10', 400);
    }

    const info = nsqfPathwayService.getNSQFLevelInfo(level);
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    next(error);
  }
};

// Apply optional authentication to all routes
router.use(attachUserIfPresent);

// Routes
router.post('/pathway/generate', generatePathway);
router.post('/employability/predict', predictEmployability);
router.post('/skill-gap/analyze', analyzeSkillGap);
router.post('/courses/recommend', recommendCourses);
router.post('/career/forecast', forecastCareer);
router.post('/schemes/applicable', getSchemes);
router.post('/skills/transferable', analyzeTransferableSkills);
router.get('/sectors', getSectors);
router.get('/level/:level', getLevelInfo);

export default router;
