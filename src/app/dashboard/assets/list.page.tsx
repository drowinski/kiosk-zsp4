import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { LoaderFunctionArgs } from '@remix-run/node';
import { AssetFilters } from '@/features/assets/components/asset-filters';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/base/pagination';

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
      itemsPerPage: pageSize || 10
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

  const visiblePageLinkCount = 5;
  const currentPage = parseInt(searchParams.get('page')!) || 0;
  const pageSize = parseInt(searchParams.get('pageSize')!) || 10;
  const totalPages = Math.ceil(assetCount / pageSize);

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
            {[...Array(visiblePageLinkCount)].map((_, i) => {
              const minPageNumber = Math.max(
                Math.min(currentPage - Math.floor(visiblePageLinkCount / 2), totalPages - (visiblePageLinkCount - 1)),
                0
              );
              const pageNumber = minPageNumber + i;

              if (pageNumber >= totalPages) {
                return;
              }

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
          </PaginationContent>
        </Pagination>
      </div>
      <Outlet />
    </main>
  );
}
