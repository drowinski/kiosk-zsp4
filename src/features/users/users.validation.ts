import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { usersTable } from '@/features/users/users.db';

export const userPasswordSchema = z.string().min(8).max(256);

export const userWithPasswordHashSchema = createSelectSchema(usersTable);
export type UserWithPasswordHash = z.infer<typeof userWithPasswordHashSchema>;

export const userSchema = userWithPasswordHashSchema.omit({ passwordHash: true });
export type User = z.infer<typeof userSchema>;

export const createUserSchema = createInsertSchema(usersTable).omit({ id: true });
export type NewUser = z.infer<typeof createUserSchema>;
