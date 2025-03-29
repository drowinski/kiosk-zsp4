import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { logger } from '@/lib/logging';
import { env } from '@/lib/env';
import * as cookieParser from 'cookie';
import { StatusCodes } from 'http-status-codes';
import { sessionService } from '@/features/sessions/sessions.service';
import { getDeleteSessionTokenCookie } from '@/features/sessions/sessions.cookies';

export const app = express();

app.use((req, res, next) => {
  req.context = {
    session: undefined
  };
  next();
});

app.use(async (req, res, next) => {
  const cookies = cookieParser.parse(req.headers.cookie ?? '');
  const sessionToken = cookies.session;
  if (!sessionToken) {
    req.context.session = undefined;
    next();
    return;
  }

  const session = await sessionService.validateSessionToken(sessionToken);
  if (!session) {
    req.context.session = undefined;
    next();
    return;
  }

  req.context = {
    session: session
  };
  next();
});

app.use(['/dashboard*'], (req, res, next) => {
  if (!req.context.session) {
    const deleteSessionTokenCookie = getDeleteSessionTokenCookie();
    res.setHeader('Set-Cookie', deleteSessionTokenCookie);
    res.status(StatusCodes.UNAUTHORIZED).send();
    return;
  }
  next();
});

app.use(env.ASSET_URL_PATH, express.static(env.ASSET_ROOT_DIR));

app.use(
  createRequestHandler({
    // eslint-disable-next-line import/no-unresolved
    build: () => import('virtual:react-router/server-build'),
    getLoadContext: (req) => ({
      logger: logger.child({ httpMethod: req.method, url: req.url }),
      session: req.context.session
    })
  })
);
