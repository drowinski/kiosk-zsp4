import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { LoaderFunctionArgs } from '@remix-run/node';
import { AssetFilters } from '@/features/assets/components/asset-filters';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';
import { ParamPagination } from '@/components/param-pagination';
import { Label } from '@/components/base/label';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { Card } from '@/components/base/card';

const DEFAULT_PAGE_SIZE = 3;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const description = url.searchParams.get('description');
  const sort = url.searchParams.get('sort');
  const page = parseInt(url.searchParams.get('page')!);
  const pageSize = parseInt(url.searchParams.get('pageSize')!);

  const filters = { description: description || undefined };

  const assetCount = await assetRepository.getAssetCount({ filters });
  const assets = await assetRepository.getAllAssets({
    pagination: {
      page: page || 0,
      pageSize: pageSize || DEFAULT_PAGE_SIZE
    },
    sorting: {
      property: (sort?.split('_').at(0) as 'updatedAt' | null) || 'updatedAt',
      direction: (sort?.split('_').at(1) as 'desc' | null) || 'desc'
    },
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

  return (
    <main className={'flex h-full flex-col gap-1'}>
      <ClientOnly>
        {() => createPortal(<AssetFilters />, document.getElementById('dashboard-side-nav-portal') as HTMLElement)}
      </ClientOnly>
      <Card className={'flex items-center gap-2 bg-secondary px-4 py-2 text-secondary-foreground'}>
        <Label>Sortowanie</Label>
        <Select
          value={searchParams.get('sort') || 'updatedAt_desc'}
          onValueChange={(value) =>
            setSearchParams((prev) => {
              prev.delete('page');
              prev.set('sort', value);
              return prev;
            })
          }
        >
          <SelectTrigger className={'min-w-64'} />
          <SelectContent
            position={'popper'}
            className={'min-w-64'}
          >
            <SelectOption value={'description_asc'}>Opis: od A do Z</SelectOption>
            <SelectOption value={'description_desc'}>Opis: od Z do A</SelectOption>
            <SelectOption value={'updatedAt_desc'}>Data modyfikacji: od najnowszych</SelectOption>
            <SelectOption value={'updatedAt_asc'}>Data modyfikacji: od najstarszych</SelectOption>
            <SelectOption value={'createdAt_desc'}>Data utworzenia: od najnowszych</SelectOption>
            <SelectOption value={'createdAt_asc'}>Data utworzenia: od najstarszych</SelectOption>
            <SelectOption value={'date_desc'}>Data: od najnowszych</SelectOption>
            <SelectOption value={'date_asc'}>Data: od najstarszych</SelectOption>
          </SelectContent>
        </Select>
      </Card>
      <AssetList className={'overflow-y-auto'}>
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
          />
        ))}
      </AssetList>
      <div>
        <ParamPagination
          key={assetCount}
          itemCount={assetCount}
          defaultPageSize={DEFAULT_PAGE_SIZE}
        />
      </div>
      <Outlet />
    </main>
  );
}
