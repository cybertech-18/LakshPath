import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  GEMINI_API_KEY: z.string({ required_error: 'GEMINI_API_KEY is required' }).min(1),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GOOGLE_CLIENT_ID: z.string({ required_error: 'GOOGLE_CLIENT_ID is required' }).min(1),
  DATABASE_URL: z.string().default('file:./dev.db'),
  CLIENT_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().default('lakshpath-dev-secret'),
  DEMO_MODE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value: 'true' | 'false') => value === 'true'),
});

const env = envSchema.parse(process.env);

export default env;
