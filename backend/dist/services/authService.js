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
const googleClient = new google_auth_library_1.OAuth2Client(env_1.default.GOOGLE_CLIENT_ID);
const TOKEN_EXPIRY = '7d';
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.default.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};
exports.authService = {
    async signInWithGoogle(credential) {
        if (!credential) {
            throw new errorHandler_1.AppError('Missing Google credential', 400);
        }
        let ticketPayload = undefined;
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
