import { ClientEnv } from '@/lib/.server/env';

declare global {
  // eslint-disable-next-line no-var
  var env: ClientEnv;
}

export {};
