import { getApiClient } from '@kiosk-zsp4/shared/lib/api-client';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import type { QueryConfig } from '@kiosk-zsp4/shared/types/query';
import type { Asset, PagedRequest } from '@kiosk-zsp4/shared/types/api';

export interface GetAssetsQueryParams extends PagedRequest {
  dateOn?: Date;
  dateFrom?: Date;
  dateTo?: Date;
  description?: string;
  status?: 'published' | 'unpublished' | 'published_unpublished' | 'deleted';
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  publishedAfter?: Date;
  publishedBefore?: Date;
  deletedAfter?: Date;
  deletedBefore?: Date;
}

function normalizeParams(params: GetAssetsQueryParams) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString().split('T')[0] : value,
    ])
  );
}

export function getAssets(
  params: GetAssetsQueryParams
): Promise<{ content: Asset[]; page: { number: number; totalPages: number } }> {
  return getApiClient().get(`/assets`, { params: normalizeParams(params) });
}

export function getAssetsQueryOptions(params: GetAssetsQueryParams = {}) {
  return infiniteQueryOptions({
    queryKey: ['assets', normalizeParams(params)],
    queryFn: ({ pageParam }) => getAssets({ ...params, page: pageParam }),
    initialPageParam: params.page,
    getNextPageParam: (lastPage) =>
      lastPage.page.number + 1 < lastPage.page.totalPages
        ? lastPage.page.number + 1
        : undefined,
  });
}

export interface UseAssetsQueryOptions {
  params?: GetAssetsQueryParams;
  queryConfig?: QueryConfig<typeof getAssetsQueryOptions>;
}

export function useAssets({ params, queryConfig }: UseAssetsQueryOptions = {}) {
  return useInfiniteQuery({
    ...getAssetsQueryOptions(params),
    ...queryConfig,
  });
}
