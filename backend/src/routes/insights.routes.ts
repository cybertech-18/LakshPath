import { Router, Request, Response, NextFunction } from 'express';
import { insightService } from '@services/insightService';

const router = Router();

router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const insights = await insightService.listForUser(req.params.userId);
    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

export default router;
