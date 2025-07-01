import { z } from '@/lib/zod';

export const baseTagSchema = z.object({
  id: z.coerce.number().positive().int(),
  name: z.string().min(1).max(128).trim()
});

export const tagSchema = baseTagSchema;
export type Tag = z.output<typeof tagSchema>;

export const createTagSchema = baseTagSchema.omit({ id: true });
export type NewTag = z.input<typeof createTagSchema>;

export const updateTagSchema = baseTagSchema.partial({
  name: true
});
export type UpdatedTag = z.input<typeof updateTagSchema>;
