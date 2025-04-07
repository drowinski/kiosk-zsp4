import { char, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from '@/features/users/.server/users.db';

export const sessionTable = pgTable('sessions', {
  id: char('id', { length: 64 }).primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull()
});
