import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { z } from '@/lib/zod';

export const dateSchema = createSelectSchema(dateTable);
export type Date = z.infer<typeof dateSchema>;

export const dateCreateSchema = createInsertSchema(dateTable).omit({ id: true });
export type NewDate = z.infer<typeof dateCreateSchema>;

export const assetSchema = createSelectSchema(assetTable).omit({ dateId: true }).extend({
  date: dateSchema.nullable()
});
export type Asset = z.infer<typeof assetSchema>;

export const assetCreateSchema = createInsertSchema(assetTable).omit({ id: true, dateId: true }).extend({
  date: dateCreateSchema.nullable()
});
export type NewAsset = z.infer<typeof assetCreateSchema>;

export const assetTypeSchema = assetSchema.shape.assetType;
export type AssetType = z.infer<typeof assetTypeSchema>;
