import { integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

export const assetType = pgEnum('asset_type', ['image', 'video', 'audio']);

export const assetTable = pgTable('assets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fileName: varchar('file_name', { length: 2048 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  assetType: assetType('type').notNull(),
  width: integer().notNull().default(0),
  height: integer().notNull().default(0),
  description: varchar('description', { length: 512 }),
});
