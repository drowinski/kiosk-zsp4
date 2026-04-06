import { type PropsWithChildren, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defaultQueryClientOptions } from '@kiosk-zsp4/shared/lib/default-query-client-options';

export function DefaultQueryClientProvider({ children }: PropsWithChildren) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: defaultQueryClientOptions,
      }),
    [],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
