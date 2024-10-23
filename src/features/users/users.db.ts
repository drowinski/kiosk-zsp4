import { char, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 254 }).unique().notNull(),
  passwordHash: char('password_hash', { length: 160 }).notNull()
});
