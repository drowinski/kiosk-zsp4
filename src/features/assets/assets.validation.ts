import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { assetTable } from '@/features/assets/assets.db';
import { z } from '@/lib/zod';

export const assetSchema = createSelectSchema(assetTable);
export type Asset = z.infer<typeof assetSchema>;

export const assetCreateSchema = createInsertSchema(assetTable).omit({ id: true });
export type NewAsset = z.infer<typeof assetCreateSchema>;

export const assetTypeSchema = assetSchema.shape.assetType;
export type AssetType = z.infer<typeof assetTypeSchema>;
