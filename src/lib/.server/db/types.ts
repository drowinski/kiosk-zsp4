import { db } from '@/lib/.server/db/connection';

export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
