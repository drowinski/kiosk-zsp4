import type { Route } from './+types/timeline.page';
import { Timeline, TimelineItem } from '@/features/timeline/components/timeline';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { getAssetUri } from '@/features/assets/utils/uris';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';

export async function loader({ context: { logger } }: Route.LoaderArgs) {
  logger.info('Getting timeline ranges...');
  const [timelineRanges, timelineRangesOk, timelineRangesError] = await tryAsync(
    timelineRepository.getAllTimelineRanges()
  );
  if (!timelineRangesOk) {
    logger.error(timelineRangesError);
    throw status(StatusCodes.BAD_REQUEST);
  }
  logger.info('Success.');
  return { timelineRanges };
}

export default function TimelinePage({ loaderData: { timelineRanges } }: Route.ComponentProps) {
  return (
    <Timeline className={'h-full'}>
      {timelineRanges.map((range) => (
        <TimelineItem
          key={range.id}
          coverUri={range.coverAsset ? getAssetUri(range.coverAsset.fileName) : ''}
          itemTitle={
            range.caption ||
            (range.minDate ? range.minDate.getUTCFullYear().toString() + ' – ' : 'do ') +
              (range.maxDate ? range.maxDate.getUTCFullYear().toString() : 'teraz')
          }
          onClickUri={`${range.id}`}
          className={'min-w-full snap-center'}
        />
      ))}
    </Timeline>
  );
}
