import { Button } from '@/components/base/button';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { formatCaption } from '@/features/timeline/utils/strings';

export async function loader() {
  const timelineRanges = await timelineRepository.getAllTimelineRanges();

  return { timelineRanges };
}

export default function TimelineSettingsPage() {
  const { timelineRanges } = useLoaderData<typeof loader>();

  return (
    <main className={'flex flex-col gap-2 p-2'}>
      <h2 className={'ml-2 text-xl font-bold'}>Oś czasu</h2>
      <div className={'flex gap-2'}>
        <div className={'flex flex-col gap-1'}>
          {timelineRanges.map((timelineRange) => (
            <Button
              key={timelineRange.id}
              variant={'accent'}
              className={'[&.active]:bg-primary [&.active]:text-primary-foreground'}
              asChild
            >
              <NavLink to={`${timelineRange.id}`}>{formatCaption(timelineRange)}</NavLink>
            </Button>
          ))}
        </div>
        <Outlet />
      </div>
    </main>
  );
}
