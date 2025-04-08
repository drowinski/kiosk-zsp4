import 'dotenv/config';
import { z } from '@/lib/zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.number().default(3000),
  DB_URL: z.string().url().min(1),
  ASSET_ROOT_DIR: z.string().min(1),
  ASSET_THUMBNAIL_DIR_NAME: z.string().min(1).default('thumbnails'),
  ASSET_URL_PATH: z.string().min(1).default('/media')
});

const clientEnvSchema = envSchema.pick({
  ASSET_URL_PATH: true,
  ASSET_THUMBNAIL_DIR_NAME: true
});
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const env = envSchema.parse(process.env);
export const clientEnv = clientEnvSchema.parse(process.env);
export const IS_PRODUCTION_ENV = env.NODE_ENV === 'production';

globalThis.CLIENT_ENV = clientEnv;
