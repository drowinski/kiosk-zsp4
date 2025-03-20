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
