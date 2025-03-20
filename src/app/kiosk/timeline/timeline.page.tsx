import { Timeline, TimelineItem } from '@/features/timeline/components/timeline';
import { useLoaderData } from '@remix-run/react';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { getAssetThumbnailUri } from '@/features/assets/utils/uris';

export async function loader() {
  const timelineRanges = await timelineRepository.getAllTimelineRanges();

  return { timelineRanges };
}

export default function TimelinePage() {
  const { timelineRanges } = useLoaderData<typeof loader>();

  return (
    <Timeline className={'h-full'}>
      {timelineRanges.map((range) => (
        <TimelineItem
          key={range.id}
          coverUri={range.coverAsset ? getAssetThumbnailUri(range.coverAsset.fileName) : ''}
          itemTitle={range.caption || undefined}
          onClickUri={`/kiosk/${range.id}`}
          className={'min-w-full snap-center'}
        />
      ))}
    </Timeline>
  );
}
