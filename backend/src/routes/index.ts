import { Router } from 'express';

import assessmentRouter from './assessment.routes';
import careersRouter from './careers.routes';
import roadmapRouter from './roadmap.routes';
import insightsRouter from './insights.routes';
import chatRouter from './chat.routes';
import jobsRouter from './jobs.routes';
import demoRouter from './demo.routes';
import marketRouter from './market.routes';
import scholarshipsRouter from './scholarships.routes';
import authRouter from './auth.routes';
import userRouter from './user.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/assessment', assessmentRouter);
router.use('/careers', careersRouter);
router.use('/roadmap', roadmapRouter);
router.use('/insights', insightsRouter);
router.use('/chat', chatRouter);
router.use('/jobs', jobsRouter);
router.use('/market', marketRouter);
router.use('/scholarships', scholarshipsRouter);
router.use('/demo', demoRouter);
router.use('/user', userRouter);

export default router;
