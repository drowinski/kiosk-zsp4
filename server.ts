import express from 'express';
import { createRequestHandler } from '@react-router/express';
import { env, IS_PRODUCTION_ENV } from '@/lib/env';
import { ServerBuild } from 'react-router';
import { logger } from '@/lib/logging';

const viteDevServer = IS_PRODUCTION_ENV
  ? null
  : await import('vite').then((vite) =>
      vite.createServer({
        server: { middlewareMode: true }
      })
    );

if (viteDevServer) {
  console.info('Using Vite dev server.');
}

const app = express();

app.use(env.ASSET_URL_PATH, express.static(env.ASSET_ROOT_DIR));
app.use(viteDevServer ? viteDevServer.middlewares : express.static('./build/client'));

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build') as Promise<ServerBuild>
  : ((await import('./build/server')) as unknown as ServerBuild);

app.all(
  '*',
  createRequestHandler({
    build,
    getLoadContext: (req, res) => {
      return {
        logger: logger.child({})
      };
    }
  })
);

app.listen(env.APP_PORT, () => {
  console.log(`App listening on http://localhost:${env.APP_PORT}`);
});
