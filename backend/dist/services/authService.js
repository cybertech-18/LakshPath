"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const emailService_1 = require("./emailService");
const googleClient = new google_auth_library_1.OAuth2Client(env_1.default.GOOGLE_CLIENT_ID);
const TOKEN_EXPIRY = '7d';
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.default.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};
const logLogin = async (userId, method, success, ipAddress, userAgent, failReason) => {
    try {
        await prisma_1.default.loginLog.create({
            data: {
                userId,
                method,
                success,
                ipAddress,
                userAgent,
                failReason,
            },
        });
        // Update user's last login and increment login count if successful
        if (success) {
            await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    lastLoginAt: new Date(),
                    loginCount: { increment: 1 },
                },
            });
        }
    }
    catch (error) {
        console.error('Failed to log login:', error);
        // Don't throw error - logging failure shouldn't block login
    }
};
exports.authService = {
    async signInWithGoogle(credential, ipAddress, userAgent) {
        if (!credential) {
            throw new errorHandler_1.AppError('Missing Google credential', 400);
        }
        let ticketPayload = undefined;
        let userId = null;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: env_1.default.GOOGLE_CLIENT_ID,
            });
            ticketPayload = ticket.getPayload() ?? undefined;
        }
        catch (error) {
            console.error('Google token verification failed', error);
            throw new errorHandler_1.AppError('Invalid Google credential', 401);
        }
        if (!ticketPayload?.email) {
            throw new errorHandler_1.AppError('Google account is missing a verified email', 400);
        }
        try {
            // Check if user already exists
            const existingUser = await prisma_1.default.user.findUnique({
                where: { email: ticketPayload.email },
            });
            const isNewUser = !existingUser;
            const user = await prisma_1.default.user.upsert({
                where: { email: ticketPayload.email },
                update: {
                    name: ticketPayload.name ?? undefined,
                    avatarUrl: ticketPayload.picture ?? undefined,
                    googleId: ticketPayload.sub,
                },
                create: {
                    email: ticketPayload.email,
                    name: ticketPayload.name ?? ticketPayload.email.split('@')[0],
                    avatarUrl: ticketPayload.picture,
                    googleId: ticketPayload.sub,
                },
            });
            userId = user.id;
            // Log successful login
            await logLogin(user.id, 'GOOGLE', true, ipAddress, userAgent);
            // Send emails only if enabled and user has email
            if (user.email) {
                try {
                    if (isNewUser && env_1.default.EMAIL_ENABLED) {
                        emailService_1.emailService.sendWelcomeEmail(user.name || 'User', user.email).catch(err => {
                            console.error('Failed to send welcome email:', err);
                        });
                    }
                    else if (!isNewUser && env_1.default.EMAIL_ENABLED) {
                        emailService_1.emailService.sendLoginAlert(user.name || 'User', user.email, {
                            method: 'Google OAuth',
                            ipAddress,
                            timestamp: new Date(),
                        }).catch(err => {
                            console.error('Failed to send login alert:', err);
                        });
                    }
                }
                catch (emailError) {
                    // Email errors should not block login
                    console.error('Email service error:', emailError);
                }
            }
            const token = createToken({ sub: user.id, email: user.email });
            return {
                token,
                user,
                isNewUser,
            };
        }
        catch (error) {
            if (userId) {
                await logLogin(userId, 'GOOGLE', false, ipAddress, userAgent, error.message);
            }
            throw error;
        }
    },
    async signInAsDemoUser(ipAddress, userAgent) {
        const email = 'demo@lakshpath.ai';
        const user = await prisma_1.default.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: 'Demo Explorer',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                googleId: 'demo-google-id',
            },
        });
        // Log demo login
        await logLogin(user.id, 'DEMO', true, ipAddress, userAgent);
        const token = createToken({ sub: user.id, email: user.email });
        return {
            token,
            user,
        };
    },
    async getCurrentUser(userId) {
        if (!userId) {
            throw new errorHandler_1.AppError('Missing user id', 400);
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        return user;
    },
};
