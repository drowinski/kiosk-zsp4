import express from 'express';
import { logger } from '@/lib/.server/logging';
import { env, IS_PRODUCTION_ENV } from '@/lib/.server/env';

const BUILD_PATH = './build/server/index.js';

const app = express();

app.disable('x-powered-by');

if (!IS_PRODUCTION_ENV) {
  logger.info('Starting development server');
  const viteDevServer = await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true }
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule('./src/server/app.ts');
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  logger.info('Starting production server');
  app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));
  app.use(express.static('build/client', { maxAge: '1h' }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.listen(env.APP_PORT, () => {
  logger.info(`Server is running on http://localhost:${env.APP_PORT}`);
});
