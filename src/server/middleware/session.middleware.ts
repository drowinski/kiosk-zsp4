import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie';
import { sessionService } from '@/features/sessions/sessions.service';

export async function sessionMiddleware(request: Request, response: Response, next: NextFunction) {
  const logger = request.context.logger;

  logger.info('Obtaining session cookie...');
  const cookies = cookieParser.parse(request.headers.cookie ?? '');
  const sessionToken = cookies.session;
  if (!sessionToken) {
    logger.info('No session cookie.');
    request.context.session = null;
    next();
    return;
  }

  logger.info('Validating session token...');
  const session = await sessionService.validateSessionToken(sessionToken);
  if (!session) {
    logger.info('Session token validation failed.');
    request.context.session = null;
    next();
    return;
  }

  logger.info('Session found.');
  request.context.session = session;
  next();
}
