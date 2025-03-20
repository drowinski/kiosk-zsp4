import { Timeline, TimelineItem } from '@/features/timeline/components/timeline';
import { useLoaderData } from '@remix-run/react';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { getAssetThumbnailUri } from '@/features/assets/utils/uris';
import { getYYYYMMDD } from '@/utils/dates';

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
          itemTitle={
            range.caption ||
            `${range.minDate ? range.minDate.getUTCFullYear() : 'przeszłość'}–${range.maxDate ? range.maxDate.getUTCFullYear() : 'teraźniejszość'}`
          }
          onClickUri={(() => {
            const searchParams = new URLSearchParams();
            if (range.minDate) searchParams.set('minDate', getYYYYMMDD(range.minDate));
            if (range.maxDate) searchParams.set('maxDate', getYYYYMMDD(range.maxDate));
            return `/kiosk/gallery?${searchParams}`;
          })()}
          className={'min-w-full snap-center'}
        />
      ))}
    </Timeline>
  );
}
