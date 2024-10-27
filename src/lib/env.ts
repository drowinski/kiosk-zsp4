import 'dotenv/config';
import { z } from '@/lib/zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_URL: z.string().url().min(1),
  ASSET_ROOT_DIR: z.string().min(1)
});

export const env = envSchema.parse(process.env);
export const IS_PRODUCTION_ENV = env.NODE_ENV === 'production';
