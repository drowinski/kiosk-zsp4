import { boolean, check, date, integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const assetType = pgEnum('asset_type', ['image', 'video', 'audio']);

export const assetTable = pgTable('assets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fileName: varchar('file_name', { length: 2048 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  assetType: assetType('type').notNull(),
  width: integer().notNull().default(0),
  height: integer().notNull().default(0),
  description: varchar('description', { length: 512 }),
  dateId: integer('date_id').references(() => dateTable.id, { onDelete: 'set null' })
});

export const datePrecision = pgEnum('date_precision', ['day', 'month', 'year', 'decade', 'century']);

export const dateTable = pgTable(
  'date_table',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    dateMin: date('date_min').notNull(),
    dateMax: date('date_max').notNull(),
    datePrecision: datePrecision('date_precision').notNull(),
    dateIsRange: boolean('date_is_range').notNull().default(false)
  },
  (table) => ({
    dateMinDateMaxCheck: check('assets_date_min_date_max_check', sql`${table.dateMin} <= ${table.dateMax}`)
  })
);
