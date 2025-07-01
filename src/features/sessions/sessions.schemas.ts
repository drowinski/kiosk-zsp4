import { z } from '@/lib/zod';
import { userSchema } from '@/features/users/users.schemas';

export const sessionBaseSchema = z.object({
  id: z.string().length(64),
  expiresAt: z.date()
});
export type BaseSession = z.infer<typeof sessionBaseSchema>;

export const sessionSchema = sessionBaseSchema.extend({
  user: userSchema
});
export type Session = z.output<typeof sessionSchema>;

export const createSessionSchema = sessionBaseSchema.extend({
  userId: userSchema.shape.id
});
export type NewSession = z.input<typeof createSessionSchema>;
