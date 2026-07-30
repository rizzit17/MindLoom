import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MOCK_MODE: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === true || val === 'true' || val === '1') return true;
      if (val === false || val === 'false' || val === '0') return false;
      // If process.env.MOCK_MODE is not explicitly set, default to true for safe CI/offline execution
      return process.env.MOCK_MODE !== 'false';
    }),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  DATABASE_PATH: z.string().default('./data/mindmaps.db'),
  MAX_INPUT_CHARS: z.number().default(12000),
});

export function getEnvConfig() {
  const rootEnv = path.resolve(__dirname, '../../../.env');
  const serverEnv = path.resolve(__dirname, '../../.env');
  const cwdEnv = path.resolve(process.cwd(), '.env');

  const envPath = fs.existsSync(rootEnv)
    ? rootEnv
    : fs.existsSync(serverEnv)
    ? serverEnv
    : cwdEnv;

  const result = dotenv.config({ path: envPath, override: true });

  const parsedEnv = {
    ...process.env,
    ...(result.parsed || {}),
  };

  const _env = envSchema.safeParse(parsedEnv);
  if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment configuration');
  }
  return _env.data;
}

export const config = getEnvConfig();
