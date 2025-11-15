"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const userService_1 = require("../services/userService");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/profile', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const payload = await userService_1.userService.getProfile(userId ?? '');
        res.json(payload);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/profile', async (req, res, next) => {
    try {
        const userId = req.user?.id ?? '';
        const payload = await userService_1.userService.updateProfile(userId, {
            name: req.body?.name,
            avatarUrl: req.body?.avatarUrl,
        });
        res.json(payload);
    }
    catch (error) {
        next(error);
    }
});
router.get('/progress', async (req, res, next) => {
    try {
        const userId = req.user?.id ?? '';
        const payload = await userService_1.userService.getProgress(userId);
        res.json(payload);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
