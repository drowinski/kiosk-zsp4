import { z } from '@/lib/zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userTable } from '@/features/users/users.db';

export const userPasswordSchema = z.string().min(8).max(256);

export const userWithPasswordHashSchema = createSelectSchema(userTable);
export type UserWithPasswordHash = z.infer<typeof userWithPasswordHashSchema>;

export const userSchema = userWithPasswordHashSchema.omit({ passwordHash: true });
export type User = z.infer<typeof userSchema>;

export const createUserSchema = createInsertSchema(userTable).omit({ id: true });
export type NewUser = z.infer<typeof createUserSchema>;
