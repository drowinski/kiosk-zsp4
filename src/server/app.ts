import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { logger } from '@/lib/logging';
import { env } from '@/lib/env';
import * as cookieParser from 'cookie';
import { sessionService } from '@/features/sessions/sessions.service';
import { getDeleteSessionTokenCookie } from '@/features/sessions/sessions.cookies';
import crypto from 'node:crypto';

export const app = express();

app.use(env.ASSET_URL_PATH, express.static(env.ASSET_ROOT_DIR));

app.use((req, res, next) => {
  const requestId = req.header('X-Request-Id') ?? crypto.randomUUID().split('-')[0];
  res.setHeader('X-Request-Id', requestId);

  req.context = {
    id: requestId,
    session: null,
    logger: logger.child({ httpMethod: req.method, url: req.url, requestId: requestId })
  };
  next();
});

app.use(async (req, res, next) => {
  const logger = req.context.logger;

  logger.info('Obtaining session cookie...');
  const cookies = cookieParser.parse(req.headers.cookie ?? '');
  const sessionToken = cookies.session;
  if (!sessionToken) {
    logger.info('No session cookie.');
    req.context.session = null;
    next();
    return;
  }

  logger.info('Validating session token...');
  const session = await sessionService.validateSessionToken(sessionToken);
  if (!session) {
    logger.info('Session token validation failed.');
    req.context.session = null;
    next();
    return;
  }

  logger.info('Session found.');
  req.context.session = session;
  next();
});

app.use(['/dashboard*'], (req, res, next) => {
  if (!req.context.session) {
    const deleteSessionTokenCookie = getDeleteSessionTokenCookie();
    res.setHeader('Set-Cookie', deleteSessionTokenCookie);
    res.redirect('/auth/sign-in');
    return;
  }
  next();
});

app.use(
  createRequestHandler({
    // eslint-disable-next-line import/no-unresolved
    build: () => import('virtual:react-router/server-build'),
    getLoadContext: (req) => ({
      logger: req.context.logger,
      session: req.context.session
    })
  })
);
