import { z } from '@/lib/zod';

const sessionBaseSchema = z.object({
  id: z.string().length(64),
  userId: z.number().positive().int(),
  expiresAt: z.date()
})

export const sessionSchema = sessionBaseSchema;
export type Session = z.output<typeof sessionSchema>;

export const createSessionSchema = sessionBaseSchema;
export type NewSession = z.input<typeof createSessionSchema>;
