import { z } from '@/lib/zod';
import { assetBaseSchema } from '@/features/assets/assets.validation';

const baseTimelineRangeSchema = z.object({
  id: z.number().positive().int(),
  minDate: z.date().nullable(),
  maxDate: z.date().nullable(),
  caption: z.string().max(32).nullable().optional()
});

export const timelineRangeSchema = baseTimelineRangeSchema.extend({
  coverAsset: assetBaseSchema.nullable()
});
export type TimelineRange = z.output<typeof timelineRangeSchema>;

export const createTimelineRangeSchema = baseTimelineRangeSchema
  .omit({ id: true })
  .partial({
    minDate: true,
    maxDate: true
  })
  .extend({
    coverAssetId: assetBaseSchema.shape.id.optional()
  })
  .refine(
    ({ minDate, maxDate }: { minDate?: Date | null; maxDate?: Date | null }) =>
      !minDate || !maxDate || minDate <= maxDate,
    {
      message: 'Data początkowa powinna być mniejsza niż końcowa.'
    }
  );
export type NewTimelineRange = z.input<typeof createTimelineRangeSchema>;

export const updateTimelineRangeSchema = baseTimelineRangeSchema
  .partial({
    minDate: true,
    maxDate: true,
    caption: true
  })
  .extend({
    coverAssetId: assetBaseSchema.shape.id.optional()
  })
  .refine(
    ({ minDate, maxDate }: { minDate?: Date | null; maxDate?: Date | null }) =>
      !minDate || !maxDate || minDate <= maxDate,
    {
      message: 'Data początkowa powinna być mniejsza niż końcowa.'
    }
  );
export type UpdatedTimelineRange = z.input<typeof updateTimelineRangeSchema>;
