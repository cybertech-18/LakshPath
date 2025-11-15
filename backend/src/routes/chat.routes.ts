import { Router, Request, Response, NextFunction } from 'express';
import { chatService } from '@services/chatService';

const router = Router();

router.post('/mentor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await chatService.mentorRound({
      userId: req.body.userId,
      round: (req.body.round as 'career' | 'interview' | 'scholarship') ?? 'career',
      message: req.body.message,
      context: req.body.context,
    });
    res.json({ reply });
  } catch (error) {
    next(error);
  }
});

export default router;
