import { pino } from 'pino';
import { IS_PRODUCTION_ENV } from '@/lib/.server/env';

const globalThisForLogger = globalThis as unknown as { logger: pino.Logger };

function getLogger() {
  console.log('Starting logger...');

  return pino({
    level: IS_PRODUCTION_ENV ? 'info' : 'debug'
  });
}

const logger = globalThisForLogger.logger || getLogger();

if (!IS_PRODUCTION_ENV) {
  globalThisForLogger.logger = logger;
}

export { logger };
