import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { env } from '@/lib/env';
import { contextMiddleware } from '@/server/middleware/context.middleware';
import { sessionMiddleware } from '@/server/middleware/session.middleware';
import { requireSessionMiddleware } from '@/server/middleware/require-session.middleware';
import { httpLogMiddleware } from '@/server/middleware/http-log.middleware';

export const app = express();
app.use(contextMiddleware);

app.use(env.ASSET_URL_PATH, express.static(env.ASSET_ROOT_DIR));

app.use(httpLogMiddleware);

app.use(sessionMiddleware);
app.use(['/dashboard*'], requireSessionMiddleware);

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
