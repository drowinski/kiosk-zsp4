import type { DefaultOptions } from '@tanstack/react-query';

export const defaultQueryClientOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;
