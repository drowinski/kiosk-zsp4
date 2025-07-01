import { integer, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { assetTable } from '@/features/assets/.server/assets.db';
import { relations } from 'drizzle-orm';

export const tagTable = pgTable('tags', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 128 }).unique().notNull()
});

export const tagRelations = relations(tagTable, ({ many }) => ({
  assets: many(assetTagJunctionTable)
}));

export const assetTagJunctionTable = pgTable(
  'assets_to_tags',
  {
    assetId: integer('asset_id')
      .notNull()
      .references(() => assetTable.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tagTable.id, { onDelete: 'cascade' })
  },
  (assetTagJunction) => ({
    pk: primaryKey({ columns: [assetTagJunction.assetId, assetTagJunction.tagId] })
  })
);

export const assetTagJunctionRelations = relations(assetTagJunctionTable, ({ one }) => ({
  asset: one(assetTable, {
    fields: [assetTagJunctionTable.assetId],
    references: [assetTable.id]
  }),
  tag: one(tagTable, {
    fields: [assetTagJunctionTable.tagId],
    references: [tagTable.id]
  })
}));
