import { sessionStorage } from '@/features/sessions/sessions.storage';
import { redirect } from 'react-router';
import { tryAsync } from '@/utils/try';

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'));
}

export async function requireSession(request: Request) {
  const [session, sessionOk] = await tryAsync(sessionStorage.getSession(request.headers.get('Cookie')));
  if (!sessionOk) {
    throw redirect('/auth/sign-in');
  }
  if (!session || !session.data?.userId) {
    throw redirect('/auth/sign-in');
  }
  return session;
}
