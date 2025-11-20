import { Request, Response, NextFunction } from 'express';
import { portfolioService } from '@services/portfolioService';

export const portfolioController = {
  /**
   * POST /api/portfolio/analyze
   * Analyze GitHub portfolio
   */
  async analyzeGitHub(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const { githubUsername, targetRole } = req.body;

      if (!githubUsername) {
        return res.status(400).json({ error: 'GitHub username is required' });
      }

      const result = await portfolioService.analyzeGitHubPortfolio(
        userId,
        githubUsername,
        targetRole
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/portfolio/:analysisId
   * Get portfolio analysis by ID
   */
  async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const { analysisId } = req.params;
      const result = await portfolioService.getAnalysis(analysisId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/portfolio/analyses
   * Get all analyses for user
   */
  async getUserAnalyses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await portfolioService.getUserAnalyses(userId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/portfolio/stats
   * Get portfolio statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const result = await portfolioService.getUserStats(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/portfolio/:analysisId
   * Delete portfolio analysis
   */
  async deleteAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const { analysisId } = req.params;
      const result = await portfolioService.deleteAnalysis(analysisId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
