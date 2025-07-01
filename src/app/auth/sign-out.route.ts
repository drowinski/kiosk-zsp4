import type { Route } from './+types/sign-out.route';
import { redirect } from 'react-router';
import { getSessionTokenDeletionCookie } from '@/features/sessions/.server/sessions.cookies';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';
import { sessionService } from '@/features/sessions/.server/sessions.service';

export async function action({ context: { logger, session } }: Route.ActionArgs) {
  logger.info('Sign out requested...');
  if (!session) {
    return null;
  }
  logger.info(`Deleting session ID "${session.id}" of user "${session.user.username}"...`);
  const [, invalidateSessionOk, invalidateSessionError] = await tryAsync(sessionService.invalidateSession(session.id));
  if (!invalidateSessionOk) {
    logger.error(invalidateSessionError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  logger.info('Deleting session cookie.');
  return redirect('/', {
    headers: {
      'Set-Cookie': getSessionTokenDeletionCookie()
    }
  });
}
