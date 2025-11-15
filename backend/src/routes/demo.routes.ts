import { Router, Request, Response, NextFunction } from 'express';
import { demoService } from '@services/demoService';

const router = Router();

router.post('/run', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = await demoService.runDemo();
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
