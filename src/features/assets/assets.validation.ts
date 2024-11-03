import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { z } from '@/lib/zod';

export const assetDateSchema = createSelectSchema(dateTable);
export type AssetDate = z.infer<typeof assetDateSchema>;

export const assetDateCreateSchema = createInsertSchema(dateTable).omit({ id: true });
export type NewAssetDate = z.infer<typeof assetDateCreateSchema>;

export const assetSchema = createSelectSchema(assetTable).omit({ dateId: true }).extend({
  date: assetDateSchema.nullable().optional()
});
export type Asset = z.infer<typeof assetSchema>;

export const assetCreateSchema = createInsertSchema(assetTable).omit({ id: true, dateId: true }).extend({
  date: assetDateCreateSchema.nullable().optional()
});
export type NewAsset = z.infer<typeof assetCreateSchema>;

export const assetTypeSchema = assetSchema.shape.assetType;
export type AssetType = z.infer<typeof assetTypeSchema>;
