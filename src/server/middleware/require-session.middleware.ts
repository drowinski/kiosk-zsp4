import { Request, Response, NextFunction } from 'express';
import { getSessionTokenDeletionCookie } from '@/features/sessions/.server/sessions.cookies';

export function requireSessionMiddleware(request: Request, response: Response, next: NextFunction) {
  if (!request.context.session) {
    request.context.logger.warn('Session required. Redirecting to sign-in page.');
    const deleteSessionTokenCookie = getSessionTokenDeletionCookie();
    response.setHeader('Set-Cookie', deleteSessionTokenCookie);
    response.redirect('/auth/sign-in');
    return;
  }
  next();
}
