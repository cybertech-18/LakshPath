import { Router, Request, Response, NextFunction } from 'express';

import { authenticate } from '@middleware/authenticate';
import { userService } from '@services/userService';

const router = Router();

router.use(authenticate);

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const payload = await userService.getProfile(userId ?? '');
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id ?? '';
    const payload = await userService.updateProfile(userId, {
      name: req.body?.name,
      avatarUrl: req.body?.avatarUrl,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id ?? '';
    const payload = await userService.getProgress(userId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
