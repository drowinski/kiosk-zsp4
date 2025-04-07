import { defineConfig } from 'drizzle-kit';
import { env } from '@/lib/.server/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/.server/db/schema.ts',
  out: './src/lib/.server/db/migrations',
  dbCredentials: {
    url: env.DB_URL
  },
  verbose: true,
  strict: true
});
