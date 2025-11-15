import { Router, Request, Response, NextFunction } from 'express';
import { marketService } from '@services/marketService';

const router = Router();

router.get('/brief', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brief = await marketService.getBrief(req.query.domain as string | undefined);
    res.json({ brief });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const history = await marketService.getHistory(req.query.domain as string | undefined, limit);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

router.post('/brief/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brief = await marketService.refreshBrief(req.body?.domain || req.query.domain);
    res.json({ brief, refreshed: true });
  } catch (error) {
    next(error);
  }
});

export default router;
