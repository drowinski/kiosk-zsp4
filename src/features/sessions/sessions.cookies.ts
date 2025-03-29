import { IS_PRODUCTION_ENV } from '@/lib/env';
import * as cookieParser from 'cookie';

export function getSessionTokenCookie(token: string, expiresAt: Date): string {
  return cookieParser.serialize('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
    secure: IS_PRODUCTION_ENV
  });
}

export function getDeleteSessionTokenCookie(): string {
  return cookieParser.serialize('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    secure: IS_PRODUCTION_ENV
  });
}
