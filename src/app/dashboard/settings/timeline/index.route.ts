import type { Route } from './+types/index.route';
import { redirect } from 'react-router';
import { tryAsync } from '@/utils/try';
import { timelineRepository } from '@/features/timeline/.server/timeline.repository';
import { status, StatusCodes } from '@/utils/status-response';

export async function loader({ context: { logger } }: Route.LoaderArgs) {
  const [timelineRanges, timelineRangesOk, timelineRangesError] = await tryAsync(
    timelineRepository.getAllTimelineRanges()
  );
  if (!timelineRangesOk) {
    logger.error(timelineRangesError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const timelineRange = timelineRanges.at(0);

  return redirect(timelineRange ? `${timelineRange.id}` : 'new');
}
