"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const linkedinController_1 = require("../controllers/linkedinController");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// LinkedIn optimization routes
router.post('/optimize', linkedinController_1.linkedinController.optimizeProfile);
router.get('/:optimizationId', linkedinController_1.linkedinController.getOptimization);
router.patch('/:optimizationId/status', linkedinController_1.linkedinController.updateStatus);
router.delete('/:optimizationId', linkedinController_1.linkedinController.deleteOptimization);
// User data routes
router.get('/optimizations', linkedinController_1.linkedinController.getUserOptimizations);
router.get('/stats', linkedinController_1.linkedinController.getUserStats);
router.post('/compare', linkedinController_1.linkedinController.compareVersions);
exports.default = router;
