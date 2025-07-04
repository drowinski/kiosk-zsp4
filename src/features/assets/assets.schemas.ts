import { z } from '@/lib/zod';
import { ASSET_TYPE_ARRAY, DATE_PRECISION_ARRAY } from '@/features/assets/assets.constants';
import { truncateDate } from '@/features/assets/utils/dates';
import { tagSchema } from '@/features/tags/tags.schemas';

// Asset Date
export const assetDatePrecisionSchema = z.enum(DATE_PRECISION_ARRAY);
export type AssetDatePrecision = z.output<typeof assetDatePrecisionSchema>;

const assetDateBaseSchema = z.object({
  id: z.coerce.number().positive().int(),
  dateMin: z.date(),
  dateMax: z.date(),
  datePrecision: assetDatePrecisionSchema,
  dateIsRange: z.boolean().default(false).optional()
});

export const assetDateSchema = assetDateBaseSchema;
export type AssetDate = z.output<typeof assetDateSchema>;

export const assetDateCreateSchema = assetDateBaseSchema
  .omit({ id: true })
  .refine(({ dateMin, dateMax }: { dateMin: Date; dateMax: Date }) => dateMin <= dateMax, {
    message: 'Pierwsza data okresu powinna być mniejsza niż druga.'
  })
  .transform((value) => {
    if (!value) return value;
    value.dateMin = truncateDate(value.dateMin, value.datePrecision);
    value.dateMax = truncateDate(value.dateMax, value.datePrecision);
    return value;
  });
export type NewAssetDate = z.input<typeof assetDateCreateSchema>;

export const assetDateUpdateSchema = assetDateCreateSchema;
export type UpdatedAssetDate = z.input<typeof assetDateUpdateSchema>;

// Asset
export const assetTypeSchema = z.enum(ASSET_TYPE_ARRAY);
export type AssetType = z.output<typeof assetTypeSchema>;

export const assetBaseSchema = z.object({
  id: z.coerce.number().positive().int(),
  fileName: z.string().max(2048),
  mimeType: z.string().max(255),
  assetType: assetTypeSchema,
  description: z.string().max(512).nullable().optional(),
  isPublished: z.boolean().default(false)
});
export type BaseAsset = z.output<typeof assetBaseSchema>;

export const assetSchema = assetBaseSchema.extend({
  date: assetDateSchema.nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(tagSchema)
});
export type Asset = z.output<typeof assetSchema>;

export const assetCreateSchema = assetBaseSchema.omit({ id: true }).extend({
  date: assetDateCreateSchema.nullable().optional()
});
export type NewAsset = z.input<typeof assetCreateSchema>;

export const assetUpdateSchema = assetBaseSchema
  .partial({
    fileName: true,
    mimeType: true,
    assetType: true,
    description: true
  })
  .extend({
    date: assetDateUpdateSchema.nullable().optional(),
    tagIds: z.array(tagSchema.shape.id).optional()
  });
export type UpdatedAsset = z.input<typeof assetUpdateSchema>;
