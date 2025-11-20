import { Router } from 'express';
import { portfolioController } from '@controllers/portfolioController';
import { attachUserIfPresent } from '@middleware/authenticate';

const router = Router();

// All routes allow optional authentication (demo mode supported)
router.use(attachUserIfPresent);

// User data routes (must come before parameterized routes)
router.get('/analyses', portfolioController.getUserAnalyses);
router.get('/stats', portfolioController.getUserStats);

// Portfolio analysis routes
router.post('/analyze', portfolioController.analyzeGitHub);
router.get('/:analysisId', portfolioController.getAnalysis);
router.delete('/:analysisId', portfolioController.deleteAnalysis);

export default router;
