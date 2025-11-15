import { Router } from 'express';
import { submitAssessment, getLatestAssessment, generateMicroTasks, getMyLatestAssessment } from '@controllers/assessmentController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.post('/', submitAssessment);
router.get('/me', authenticate, getMyLatestAssessment);
router.get('/:userId', getLatestAssessment);
router.post('/:userId/micro-tasks', generateMicroTasks);

export default router;
