import { Router, Request, Response, NextFunction } from 'express';
import { assessmentService } from '@services/assessmentService';

const router = Router();

router.get('/matches/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await assessmentService.getLatestForUser(req.params.userId);
    res.json({ career_matches: data.career_matches });
  } catch (error) {
    next(error);
  }
});

export default router;
