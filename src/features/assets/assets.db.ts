import { boolean, check, date, integer, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ASSET_TYPE_ARRAY, DATE_PRECISION_ARRAY } from '@/features/assets/assets.constants';

export const assetTypeEnum = pgEnum('asset_type', ASSET_TYPE_ARRAY);

export const assetTable = pgTable('assets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fileName: varchar('file_name', { length: 2048 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  assetType: assetTypeEnum('type').notNull(),
  description: varchar('description', { length: 512 }),
  dateId: integer('date_id').references(() => dateTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const datePrecisionEnum = pgEnum('date_precision', DATE_PRECISION_ARRAY);

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
