import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { LoaderFunctionArgs } from '@remix-run/node';
import { AssetFilters } from '@/features/assets/components/asset-filters';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/base/pagination';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const description = url.searchParams.get('description');
  const sortBy = url.searchParams.get('sortBy');
  const sortDir = url.searchParams.get('sortDir');
  const page = parseInt(url.searchParams.get('page')!);
  const pageSize = parseInt(url.searchParams.get('pageSize')!);

  const filters = { description: description || undefined };

  const assetCount = await assetRepository.getAssetCount({ filters });
  const assets = await assetRepository.getAllAssets({
    pagination: {
      page: page || 0,
      itemsPerPage: pageSize || 3
    },
    sorting: sortBy
      ? {
          property: sortBy as 'description' | 'date',
          direction: sortDir as 'asc' | 'desc'
        }
      : undefined,
    filters
  });

  return { assets, assetCount };
}

export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname !== nextUrl.pathname) {
    return false;
  }

  return defaultShouldRevalidate;
}

export default function AssetListPage() {
  const { assets, assetCount } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page')!) || 0;
  const pageSize = parseInt(searchParams.get('pageSize')!) || 3;
  const totalPageCount = Math.ceil(assetCount / pageSize);
  const visiblePageLinkCount = 5;
  const minPageNumber = Math.max(
    Math.min(currentPage - Math.floor(visiblePageLinkCount / 2), totalPageCount - visiblePageLinkCount),
    0
  );

  const previousPageSearchParams = new URLSearchParams(searchParams);
  previousPageSearchParams.set('page', (currentPage - 1).toString());
  const nextPageSearchParams = new URLSearchParams(searchParams);
  nextPageSearchParams.set('page', (currentPage + 1).toString());

  return (
    <main className={'flex h-full flex-col gap-1'}>
      <ClientOnly>
        {() => createPortal(<AssetFilters />, document.getElementById('dashboard-side-nav-portal') as HTMLElement)}
      </ClientOnly>
      <AssetList className={'overflow-y-auto'}>
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
          />
        ))}
      </AssetList>
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                isDisabled={currentPage <= 0}
                to={{ search: previousPageSearchParams.toString() }}
              />
            </PaginationItem>
            {minPageNumber > 0 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {[...Array(visiblePageLinkCount)].map((_, i) => {
              const pageNumber = minPageNumber + i;

              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', pageNumber.toString());

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    to={{ search: newParams.toString() }}
                  >
                    {pageNumber + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {minPageNumber + visiblePageLinkCount < totalPageCount && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                isDisabled={currentPage >= totalPageCount - 1}
                to={{ search: nextPageSearchParams.toString() }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <Outlet />
    </main>
  );
}
