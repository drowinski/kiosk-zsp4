import { pino } from 'pino';
import { Session } from '@/features/sessions/sessions.validation';

declare module 'express-serve-static-core' {
  interface Request {
    context: {
      session?: Session;
    };
  }
}

declare module 'react-router' {
  // Your AppLoadContext used in v2
  interface AppLoadContext {
    logger: pino.Logger;
    session?: Session;
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
