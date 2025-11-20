"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolioController_1 = require("../controllers/portfolioController");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// Portfolio analysis routes
router.post('/analyze', portfolioController_1.portfolioController.analyzeGitHub);
router.get('/:analysisId', portfolioController_1.portfolioController.getAnalysis);
router.delete('/:analysisId', portfolioController_1.portfolioController.deleteAnalysis);
// User data routes
router.get('/analyses', portfolioController_1.portfolioController.getUserAnalyses);
router.get('/stats', portfolioController_1.portfolioController.getUserStats);
exports.default = router;
