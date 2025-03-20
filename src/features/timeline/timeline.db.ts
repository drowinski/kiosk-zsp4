import { check, date, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { assetTable } from '@/features/assets/assets.db';

export const timelineRangesTable = pgTable(
  'timeline_ranges',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    minDate: date('min_date', { mode: 'date' }),
    maxDate: date('max_date', { mode: 'date' }),
    caption: varchar('caption', { length: 32 }),
    coverAssetId: integer('cover_asset_id').references(() => assetTable.id)
  },
  (table) => ({
    minDateMaxDateCheck: check('timeline_ranges_min_date_max_date_check', sql`${table.minDate} <= ${table.maxDate}`)
  })
);
