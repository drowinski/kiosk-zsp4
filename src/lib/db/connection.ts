import { drizzle } from 'drizzle-orm/node-postgres';
import { env, IS_PRODUCTION_ENV } from '@/lib/env';
import pg from 'pg';
import * as schema from '@/lib/db/schema';

const globalThisForClient = globalThis as unknown as { client: pg.Pool };

const client =
  globalThisForClient.client ||
  new pg.Pool({
    connectionString: env.DB_URL
  });

if (!IS_PRODUCTION_ENV) {
  globalThisForClient.client = client;
}

export const db = drizzle({ client: client, schema: { ...schema } });
