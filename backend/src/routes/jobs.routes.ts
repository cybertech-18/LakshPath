import { Router, Request, Response, NextFunction } from 'express';
import { jobsService } from '@services/jobsService';

const router = Router();

router.get('/list', (req: Request, res: Response) => {
  res.json({ jobs: jobsService.listJobs(req.query.domain as string | undefined) });
});

router.get('/comparisons/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await jobsService.listComparisons(req.params.userId);
    res.json({ comparisons: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analysis = await jobsService.compareDescription({
      userId: req.body.userId,
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      jobDescription: req.body.jobDescription,
    });
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

router.get('/auto-scout/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const refresh = typeof req.query.refresh === 'string'
      ? ['true', '1', 'yes'].includes((req.query.refresh as string).toLowerCase())
      : undefined;

    const autoScout = await jobsService.getAutoScoutComparisons(req.params.userId, {
      limit,
      domain: req.query.domain as string | undefined,
      refresh,
    });

    res.json({ autoScout });
  } catch (error) {
    next(error);
  }
});

export default router;
