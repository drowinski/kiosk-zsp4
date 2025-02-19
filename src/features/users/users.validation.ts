import { z } from '@/lib/zod';

export const userPasswordSchema = z.string().min(8).max(256);
export const userPasswordHashSchema = z.string().length(160);

const userBaseSchema = z.object({
  id: z.number().positive().int(),
  username: z.string().min(4).max(32)
});

export const userWithPasswordHashSchema = userBaseSchema.extend({
  passwordHash: userPasswordHashSchema
});
export type UserWithPasswordHash = z.output<typeof userWithPasswordHashSchema>;

export const userSchema = userBaseSchema;
export type User = z.output<typeof userSchema>;

export const createUserSchema = userWithPasswordHashSchema.omit({ id: true });
export type NewUser = z.input<typeof createUserSchema>;
