import { TimelineRange } from '@/features/timeline/timeline.validation';

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
