"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.post('/google', authController_1.authController.googleSignIn);
router.post('/demo', authController_1.authController.demoSignIn);
router.get('/me', authenticate_1.authenticate, authController_1.authController.getCurrentUser);
router.post('/logout', (_req, res) => {
    res.status(200).json({ message: 'Logged out' });
});
exports.default = router;
