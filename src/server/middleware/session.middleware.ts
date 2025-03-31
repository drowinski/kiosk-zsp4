import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie';
import { sessionService } from '@/features/sessions/sessions.service';
import { tryAsync } from '@/utils/try';

export async function sessionMiddleware(request: Request, response: Response, next: NextFunction) {
  const logger = request.context.logger;
  logger.info('Checking session...');

  const cookies = cookieParser.parse(request.headers.cookie ?? '');
  const sessionToken = cookies.session;
  if (!sessionToken) {
    logger.info('No session cookie.');
    request.context.session = null;
    next();
    return;
  }

  const [session, sessionOk, sessionError] = await tryAsync(sessionService.validateSessionToken(sessionToken));
  if (!sessionOk) {
    logger.error(sessionError);
    request.context.session = null;
    next();
    return;
  }
  if (!session) {
    logger.info('Session token validation failed.');
    request.context.session = null;
    next();
    return;
  }

  logger.info(`Session user: "${session.user.username}" | Session ID: "${session.id}"`);
  request.context.session = session;
  next();
}
