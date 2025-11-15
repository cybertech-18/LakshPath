"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
exports.authController = {
    async googleSignIn(req, res, next) {
        try {
            const { credential } = req.body;
            const result = await authService_1.authService.signInWithGoogle(credential ?? '');
            res.status(200).json({
                token: result.token,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    avatarUrl: result.user.avatarUrl,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getCurrentUser(req, res, next) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const user = await authService_1.authService.getCurrentUser(req.user.id);
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
