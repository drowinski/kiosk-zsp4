import { boolean, check, date, integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const assetTypeEnum = pgEnum('asset_type', ['image', 'video', 'audio']);

export const assetTable = pgTable('assets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fileName: varchar('file_name', { length: 2048 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  assetType: assetTypeEnum('type').notNull(),
  width: integer().notNull().default(0),
  height: integer().notNull().default(0),
  description: varchar('description', { length: 512 }),
  dateId: integer('date_id').references(() => dateTable.id, { onDelete: 'set null' })
});

const datePrecision = ['day', 'month', 'year', 'decade', 'century'] as const;
export const datePrecisionEnum = pgEnum('date_precision', datePrecision);
export type AssetDatePrecision = typeof datePrecision[number];

export const dateTable = pgTable(
  'date_table',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    dateMin: date('date_min', { mode: 'date' }).notNull(),
    dateMax: date('date_max', { mode: 'date' }).notNull(),
    datePrecision: datePrecisionEnum('date_precision').notNull(),
    dateIsRange: boolean('date_is_range').notNull().default(false)
  },
  (table) => ({
    dateMinDateMaxCheck: check('assets_date_min_date_max_check', sql`${table.dateMin} <= ${table.dateMax}`)
  })
);
