import { integer, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { assetTable } from '@/features/assets/assets.db';

export const tagTable = pgTable('tags', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 128 }).unique().notNull()
});

export const assetTagJunction = pgTable(
  'assets_to_tags',
  {
    assetId: integer('id')
      .notNull()
      .references(() => assetTable.id),
    tagId: integer('id')
      .notNull()
      .references(() => tagTable.id)
  },
  (assetTagJunction) => ({
    pk: primaryKey({ columns: [assetTagJunction.assetId, assetTagJunction.tagId] })
  })
);
