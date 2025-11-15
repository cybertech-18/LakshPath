import { Router, Request, Response } from 'express';

import { authController } from '@controllers/authController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.post('/google', authController.googleSignIn);
router.get('/me', authenticate, authController.getCurrentUser);

router.post('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged out' });
});

export default router;
