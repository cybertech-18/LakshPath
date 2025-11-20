"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interviewController_1 = require("../controllers/interviewController");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// Interview session routes
router.post('/start', interviewController_1.interviewController.startSession);
router.post('/answer', interviewController_1.interviewController.submitAnswer);
router.post('/:sessionId/complete', interviewController_1.interviewController.completeSession);
router.get('/:sessionId', interviewController_1.interviewController.getSession);
router.get('/:sessionId/next', interviewController_1.interviewController.getNextQuestion);
// User data routes
router.get('/sessions', interviewController_1.interviewController.getUserSessions);
router.get('/stats', interviewController_1.interviewController.getUserStats);
exports.default = router;
