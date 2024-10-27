import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sessionTable } from '@/features/sessions/sessions.db';
import { z } from '@/lib/zod';

export const sessionSchema = createSelectSchema(sessionTable);
export type Session = z.infer<typeof sessionSchema>;

export const createSessionSchema = createInsertSchema(sessionTable);
export type NewSession = z.infer<typeof createSessionSchema>;
