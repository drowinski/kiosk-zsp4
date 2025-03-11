import { z } from '@/lib/zod';

export const userPasswordSchema = z.string().min(8).max(256);
export const userPasswordHashSchema = z.string().length(160);

const userBaseSchema = z.object({
  id: z.number().positive().int(),
  username: z.string().trim().min(4).max(32),
  isSuperuser: z.boolean().default(false)
});

export const userSchema = userBaseSchema;
export type User = z.output<typeof userSchema>;

export const userWithPasswordHashSchema = userBaseSchema.extend({
  passwordHash: userPasswordHashSchema
});
export type UserWithPasswordHash = z.output<typeof userWithPasswordHashSchema>;

export const createUserSchema = userWithPasswordHashSchema.omit({ id: true });
export type NewUser = z.input<typeof createUserSchema>;

export const updateUserSchema = userBaseSchema.extend({ password: userPasswordSchema }).partial({
  username: true,
  password: true,
  isSuperuser: true
});
export type UpdatedUser = z.input<typeof updateUserSchema>;

export const updateUserWithPasswordHashSchema = userWithPasswordHashSchema.partial({
  username: true,
  passwordHash: true,
  isSuperuser: true
});
export type UpdatedUserWithPasswordHash = z.input<typeof updateUserSchema>;
