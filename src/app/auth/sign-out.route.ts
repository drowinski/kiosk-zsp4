import type { Route } from './+types/sign-out.route';
import { redirect } from 'react-router';
import { getSession } from '@/features/sessions/sessions.server-utils';
import { sessionStorage } from '@/features/sessions/sessions.storage';

export async function action({ request, context: { logger } }: Route.ActionArgs) {
  logger.info('Sign out requested...');
  const session = await getSession(request);
  if (!session.get('userId')) {
    return null;
  }
  logger.info(`Destroying session of user ID: ${session.get('userId')}...`);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session)
    }
  });
}
