import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, ShouldRevalidateFunctionArgs, useLoaderData } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { AssetFilters } from '@/features/assets/components/asset-filters';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const description = url.searchParams.get('description');
  const sortBy = url.searchParams.get('sortBy');
  console.log(description);
  const assets = await assetRepository.getAllAssets({
    filters: { description: description || undefined },
    sorting: sortBy ? { property: sortBy as 'description' | 'date', direction: 'desc' } : undefined
  });
  return { assets };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(await request.json());
}

export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname !== nextUrl.pathname) {
    return false;
  }

  return defaultShouldRevalidate;
}

export default function AssetListPage() {
  const { assets } = useLoaderData<typeof loader>();

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
      <Outlet />
    </main>
  );
}
