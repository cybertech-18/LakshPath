import { Request, Response, NextFunction } from 'express';
import { assessmentService } from '@services/assessmentService';

export const submitAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await assessmentService.submitAssessment(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLatestAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.params.userId || req.query.userId) as string;
    const result = await assessmentService.getLatestForUser(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyLatestAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const result = await assessmentService.getLatestForUser(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const generateMicroTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.params.userId || req.body.userId) as string;
    const result = await assessmentService.generateMicroTasks(userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
