import { sessionStorage } from '@/features/sessions/sessions.storage';
import { redirect } from '@remix-run/node';

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'));
}

export async function requireSession(request: Request) {
  let session;
  try {
    session = await sessionStorage.getSession(request.headers.get('Cookie'));
  } catch (error) {
    throw redirect('/auth/sign-in');
  }
  if (!session || !session.data.userId) {
    throw redirect('/auth/sign-in');
  }
  return session;
}
