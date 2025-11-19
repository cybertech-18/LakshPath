"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const mentorController_1 = require("../controllers/mentorController");
const router = (0, express_1.Router)();
// All mentor routes require authentication
router.use(authenticate_1.authenticate);
// Analyze user profile
router.get('/analyze', mentorController_1.mentorController.analyzeProfile);
// Start a new mentor session
router.post('/session/start', mentorController_1.mentorController.startSession);
// Continue chat with mentor
router.post('/chat', mentorController_1.mentorController.chat);
// Get mentor conversation history
router.get('/history', mentorController_1.mentorController.getHistory);
exports.default = router;
