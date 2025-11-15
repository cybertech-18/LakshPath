import { Router, Request, Response } from 'express';
import { scholarshipService } from '@services/scholarshipService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ scholarships: scholarshipService.list() });
});

export default router;
