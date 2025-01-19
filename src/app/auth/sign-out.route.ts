import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { getSession } from '@/features/sessions/sessions.utils';
import { sessionStorage } from '@/features/sessions/sessions.storage';

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  if (!session) {
    return null;
  }
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session)
    }
  });
}
