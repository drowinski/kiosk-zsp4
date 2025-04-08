import { TimelineRange } from '@/features/timeline/timeline.schemas';

export function formatCaption({
  caption,
  minDate,
  maxDate
}: Pick<TimelineRange, 'caption' | 'minDate' | 'maxDate'>): string {
  return (
    caption ||
    (minDate ? minDate.getUTCFullYear().toString() + ' – ' : 'do ') +
      (maxDate ? maxDate.getUTCFullYear().toString() : 'teraz')
  );
}
