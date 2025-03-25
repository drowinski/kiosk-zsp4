import { pino } from 'pino';

declare module 'react-router' {
  // Your AppLoadContext used in v2
  interface AppLoadContext {
    logger: pino.Logger;
  }

  // TODO: remove this once we've migrated to `Route.LoaderArgs` instead for our loaders
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: remove this once we've migrated to `Route.ActionArgs` instead for our actions
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}
