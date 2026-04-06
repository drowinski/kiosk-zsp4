import { getApiClient } from '@kiosk-zsp4/shared/lib/api-client';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { QueryConfig } from '@kiosk-zsp4/shared/types/query';
import { getAuthToken } from '@kiosk-zsp4/shared/features/auth/utils/token';
import type { User } from '@kiosk-zsp4/shared/types/api';

export function getAuthenticatedUser(): Promise<User> {
  if (!getAuthToken()) {
    return Promise.reject(new Error('Token not set'));
  }

  return getApiClient().get('/users/me');
}

export function getAuthenticatedUserQueryOptions() {
  return queryOptions({
    queryKey: ['me'],
    queryFn: () => getAuthenticatedUser(),
  });
}

interface UseAuthenticatedUserOptions {
  queryConfig?: QueryConfig<typeof getAuthenticatedUserQueryOptions>;
}

export function useAuthenticatedUser({
  queryConfig,
}: UseAuthenticatedUserOptions = {}) {
  return useQuery({
    ...getAuthenticatedUserQueryOptions(),
    ...queryConfig,
  });
}
