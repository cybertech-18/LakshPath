import { Router, Request, Response, NextFunction } from 'express';
import { roadmapService } from '@services/roadmapService';

const router = Router();

router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roadmap = await roadmapService.getActiveRoadmap(req.params.userId);
    res.json({ learning_roadmap: roadmap });
  } catch (error) {
    next(error);
  }
});

router.patch('/milestone/:milestoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await roadmapService.updateMilestoneStatus(
      req.params.milestoneId,
      (req.body.status as string) ?? 'IN_PROGRESS'
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
