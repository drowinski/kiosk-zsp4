import { boolean, char, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 32 }).unique().notNull(),
  passwordHash: char('password_hash', { length: 160 }).notNull(),
  isSuperuser: boolean('is_superuser').notNull().default(false)
});
