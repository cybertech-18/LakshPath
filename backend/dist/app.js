"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = __importDefault(require("./config/env"));
const index_1 = __importDefault(require("./routes/index"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const allowedOrigins = env_1.default.CLIENT_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowAllOrigins = !allowedOrigins || allowedOrigins.length === 0 || allowedOrigins.includes('*');
const corsOptions = allowAllOrigins
    ? { origin: true, credentials: true }
    : {
        origin(origin, callback) {
            if (!origin || allowedOrigins?.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    };
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)(env_1.default.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api', index_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
