"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUserIfPresent = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const extractToken = (req) => {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        return header.substring('Bearer '.length);
    }
    return null;
};
const authenticate = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        return next();
    }
    catch (error) {
        console.error('JWT verification failed', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const attachUserIfPresent = (req, _res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next();
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
    }
    catch (error) {
        console.warn('Optional JWT verification failed', error);
    }
    next();
};
exports.attachUserIfPresent = attachUserIfPresent;
