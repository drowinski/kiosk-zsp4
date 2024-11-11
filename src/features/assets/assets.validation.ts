import { z } from '@/lib/zod';
import { ASSET_TYPE_ARRAY, DATE_PRECISION_ARRAY } from '@/features/assets/assets.constants';

// Asset Date
export const datePrecisionSchema = z.enum(DATE_PRECISION_ARRAY);
export type AssetDatePrecision = z.output<typeof datePrecisionSchema>;

const assetDateBaseSchema = z.object({
  id: z.number().positive().int(),
  dateMin: z.date(),
  dateMax: z.date(),
  datePrecision: datePrecisionSchema,
  dateIsRange: z.boolean().default(false).nullable().optional()
});

export const assetDateSchema = assetDateBaseSchema;
export type AssetDate = z.output<typeof assetDateSchema>;

export const assetDateCreateSchema = assetDateSchema
  .omit({ id: true })
  .refine(({ dateMin, dateMax }: { dateMin: Date; dateMax: Date }) => dateMin <= dateMax, {
    message: 'Minimalna data powinna być mniejsza niż maksymalna.',
    path: ['dateMin+dateMax']
  });
export type NewAssetDate = z.input<typeof assetDateCreateSchema>;

// Asset
export const assetTypeSchema = z.enum(ASSET_TYPE_ARRAY);
export type AssetType = z.output<typeof assetTypeSchema>;

export const assetBaseSchema = z.object({
  fileName: z.string().max(2048),
  mimeType: z.string().max(255),
  assetType: assetTypeSchema,
  description: z.string().max(512).nullable().optional()
});

export const assetSchema = assetBaseSchema.extend({
  id: z.number().positive().int(),
  date: assetDateSchema.nullable().optional()
});
export type Asset = z.output<typeof assetSchema>;

export const assetCreateSchema = assetBaseSchema.extend({ date: assetDateCreateSchema.nullable().optional() });
export type NewAsset = z.input<typeof assetCreateSchema>;
