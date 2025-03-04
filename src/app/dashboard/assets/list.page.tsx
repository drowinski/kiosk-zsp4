import { AssetFiltering, assetRepository } from '@/features/assets/assets.repository';
import { Link, Outlet, ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { LoaderFunctionArgs } from '@remix-run/node';
import { AssetFilters } from '@/features/assets/components/asset-filters';
import { ParamPagination } from '@/components/param-pagination';
import { Label } from '@/components/base/label';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { PlusIcon } from '@/components/icons';
import { AssetType } from '@/features/assets/assets.validation';

const DEFAULT_PAGE_SIZE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const description = url.searchParams.get('description');
  const assetType = url.searchParams.get('assetType');
  const minYear = parseInt(url.searchParams.get('minYear') ?? '') || undefined;
  const maxYear = parseInt(url.searchParams.get('maxYear') ?? '') || undefined;
  const sort = url.searchParams.get('sort');
  const page = parseInt(url.searchParams.get('page')!);
  const pageSize = parseInt(url.searchParams.get('pageSize')!);

  const filters: AssetFiltering = {
    description: description || undefined,
    assetType: (assetType?.split('_') as AssetType[]) || undefined,
    ...(minYear && { dateMin: new Date(minYear, 0, 1) }),
    ...(maxYear && { dateMax: new Date(maxYear + 1, 0, 1) })
  };

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
    <main className={'flex h-full gap-2'}>
      <div className={'flex flex-col gap-1'}>
        <Button asChild>
          <Link
            to={'upload'}
            className={'inline-flex items-center gap-1'}
          >
            <PlusIcon /> Dodaj nową zawartość
          </Link>
        </Button>
        <AssetFilters />
      </div>
      <div className={'flex grow flex-col gap-1'}>
        <Card className={'flex items-center justify-end gap-2 bg-secondary px-4 py-2 text-secondary-foreground'}>
          <Label variant={'horizontal'} className={'gap-2'}>
            Sortowanie
            <Select
              defaultValue={searchParams.get('sort') || 'updatedAt_desc'}
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
          </Label>
        </Card>
        {assetCount > 0 ? (
          <AssetList>
            {assets.map((asset) => (
              <AssetListItem
                key={asset.id}
                asset={asset}
              />
            ))}
          </AssetList>
        ) : (
          <div className={'text-muted flex items-center justify-center p-4 font-medium'}>Brak wyników</div>
        )}
        <div>
          <ParamPagination
            itemCount={assetCount}
            defaultPageSize={DEFAULT_PAGE_SIZE}
          />
        </div>
      </div>
      <Outlet />
    </main>
  );
}
