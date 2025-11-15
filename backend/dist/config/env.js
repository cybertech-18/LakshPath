"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    GEMINI_API_KEY: zod_1.z.string({ required_error: 'GEMINI_API_KEY is required' }).min(1),
    GEMINI_MODEL: zod_1.z.string().default('gemini-2.0-flash'),
    GOOGLE_CLIENT_ID: zod_1.z.string({ required_error: 'GOOGLE_CLIENT_ID is required' }).min(1),
    DATABASE_URL: zod_1.z.string().default('file:./dev.db'),
    CLIENT_ORIGIN: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().default('lakshpath-dev-secret'),
    DEMO_MODE_ENABLED: zod_1.z
        .enum(['true', 'false'])
        .default('true')
        .transform((value) => value === 'true'),
});
const env = envSchema.parse(process.env);
exports.default = env;
