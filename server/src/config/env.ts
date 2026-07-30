import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MOCK_MODE: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  DATABASE_PATH: z.string().default('./data/mindmaps.db'),
  MAX_INPUT_CHARS: z.number().default(12000),
});

export function getEnvConfig() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
  dotenv.config({ override: true });
  const _env = envSchema.safeParse(process.env);
  if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment configuration');
  }
  return _env.data;
}

export const config = getEnvConfig();
