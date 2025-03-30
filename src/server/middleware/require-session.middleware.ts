import { Request, Response, NextFunction } from 'express';
import { getDeleteSessionTokenCookie } from '@/features/sessions/sessions.cookies';

export function requireSessionMiddleware(request: Request, response: Response, next: NextFunction) {
  if (!request.context.session) {
    const deleteSessionTokenCookie = getDeleteSessionTokenCookie();
    response.setHeader('Set-Cookie', deleteSessionTokenCookie);
    response.redirect('/auth/sign-in');
    return;
  }
  next();
}
