import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, ShouldRevalidateFunctionArgs, useLoaderData } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { LoaderFunctionArgs } from '@remix-run/node';
import { AssetFilters } from '@/features/assets/components/asset-filters';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';
import { ParamPagination } from '@/components/param-pagination';

const DEFAULT_PAGE_SIZE = 3;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const description = url.searchParams.get('description');
  const sortBy = url.searchParams.get('sortBy') as 'description' | 'date' | null;
  const sortDir = url.searchParams.get('sortDir') as 'asc' | 'desc' | null;
  const page = parseInt(url.searchParams.get('page')!);
  const pageSize = parseInt(url.searchParams.get('pageSize')!);

  const filters = { description: description || undefined };

  const assetCount = await assetRepository.getAssetCount({ filters });
  const assets = await assetRepository.getAllAssets({
    pagination: {
      page: page || 0,
      pageSize: pageSize || DEFAULT_PAGE_SIZE
    },
    sorting: sortBy && sortDir
      ? {
          property: sortBy,
          direction: sortDir
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
        <ParamPagination key={assetCount} itemCount={assetCount} defaultPageSize={DEFAULT_PAGE_SIZE} />
      </div>
      <Outlet />
    </main>
  );
}
