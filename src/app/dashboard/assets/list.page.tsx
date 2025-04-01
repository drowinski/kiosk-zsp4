import type { Route } from './+types/list.page';
import { AssetFiltering, assetRepository } from '@/features/assets/assets.repository';
import { Link, Outlet, ShouldRevalidateFunctionArgs, useLocation, useSearchParams, useSubmit } from 'react-router';
import { AssetList, AssetListItem } from '@/app/dashboard/assets/_components/asset-list';
import { AssetFilters } from '@/app/dashboard/assets/_components/asset-filters';
import { ParamPagination } from '@/components/param-pagination';
import { Label } from '@/components/base/label';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { PlusIcon } from '@/components/icons';
import { Asset, assetSchema } from '@/features/assets/assets.validation';
import { useEffect, useState } from 'react';
import { AssetDeleteModal } from '@/app/dashboard/assets/_components/asset-delete-modal';
import { Checkbox } from '@/components/base/checkbox';
import { z } from '@/lib/zod';
import { assetService } from '@/features/assets/assets.service';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';

const DEFAULT_PAGE_SIZE = 10;

const loaderParamsSchema = z.object({
  description: assetSchema.shape.description.optional(),
  assetType: z
    .string()
    .transform((assetType) => Array.from(new Set(assetType.split('_'))))
    .pipe(z.array(assetSchema.shape.assetType))
    .optional(),
  minYear: z.coerce
    .number()
    .positive()
    .transform((minYear) => new Date(minYear, 0, 1))
    .optional(),
  maxYear: z.coerce
    .number()
    .positive()
    .transform((maxYear) => new Date(maxYear, 11, 31))
    .optional(),
  sort: z
    .string()
    .optional()
    .transform((sort) =>
      sort
        ? {
            property: sort.split('_').at(0),
            direction: sort.split('_').at(1)
          }
        : undefined
    )
    .pipe(
      z
        .object({
          property: z.enum(['description', 'date', 'createdAt', 'updatedAt']),
          direction: z.enum(['asc', 'desc'])
        })
        .default({
          property: 'updatedAt',
          direction: 'desc'
        })
    ),
  page: z.coerce.number().nonnegative().optional().default(0),
  pageSize: z.coerce.number().positive().optional().default(DEFAULT_PAGE_SIZE)
});

export async function loader({ request, context: { logger } }: Route.LoaderArgs) {
  const url = new URL(request.url);

  logger.info('Parsing params...');
  const [params, parsedParamsOk, parsedParamsError] = await tryAsync(
    loaderParamsSchema.parseAsync(Object.fromEntries(url.searchParams.entries()))
  );
  if (!parsedParamsOk) {
    logger.error(parsedParamsError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  const filters: AssetFiltering = {
    description: params?.description || undefined,
    assetType: params?.assetType || undefined,
    dateMin: params?.minYear || undefined,
    dateMax: params?.maxYear || undefined
  };

  logger.info('Getting asset count...');
  const [assetCount, assetCountOk, assetCountError] = await tryAsync(assetRepository.getAssetCount({ filters }));
  if (!assetCountOk) {
    logger.error(assetCountError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Getting assets...');
  const [assets, assetsOk, assetsError] = await tryAsync(
    assetRepository.getAssets({
      pagination: {
        page: params.page,
        pageSize: params.pageSize
      },
      sorting: {
        property: params.sort.property,
        direction: params.sort.direction
      },
      filters
    })
  );
  if (!assetsOk) {
    logger.error(assetsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Success.');
  return { assets, assetCount };
}

const assetsDeleteSchema = z.object({
  ids: z.array(assetSchema.shape.id)
});

export async function action({ request, context: { logger } }: Route.ActionArgs) {
  if (request.method === 'DELETE') {
    logger.info('Parsing form data...');
    const formData = await request.json();
    const [data, dataOk, dataError] = await tryAsync(assetsDeleteSchema.parseAsync(formData));
    if (!dataOk) {
      logger.error(dataError);
      return status(StatusCodes.BAD_REQUEST);
    }

    logger.info('Deleting assets...');
    const [, deleteAssetsOk, deleteAssetsError] = await tryAsync(assetService.deleteAssets(...data.ids));
    if (!deleteAssetsOk) {
      logger.error(deleteAssetsError);
      return status(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    logger.info('Success.');
    return status(StatusCodes.NO_CONTENT);
  } else {
    return null;
  }
}

export function shouldRevalidate({ nextUrl, actionResult, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (!nextUrl.pathname.endsWith('assets')) {
    return false;
  }

  if (actionResult) {
    return false;
  }

  return defaultShouldRevalidate;
}

export default function AssetListPage({ loaderData: { assets, assetCount } }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const submit = useSubmit();

  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<Asset['id']>>(new Set());

  useEffect(() => {
    setSelectedAssetIds((prev) => {
      const newSet = new Set<number>();
      for (const id of assets.map((asset) => asset.id)) {
        if (prev.has(id)) {
          newSet.add(id);
        }
      }
      return newSet;
    });
  }, [assets]);

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
        <Card className={'flex items-center gap-2 bg-secondary px-4 py-2 text-secondary-foreground'}>
          <Checkbox
            checked={
              (assets.length > 0 && selectedAssetIds.size === assets.length) ||
              (selectedAssetIds.size > 0 && 'indeterminate')
            }
            onCheckedChange={(checked) => {
              if (checked === true) {
                setSelectedAssetIds(assets.reduce((set, asset) => set.add(asset.id), new Set<number>()));
              } else if (checked === false) {
                setSelectedAssetIds(new Set());
              }
            }}
            aria-label={'zaznacz wszystkie'}
          />
          {selectedAssetIds.size > 0 && (
            <div className={'flex items-center gap-1'}>
              <span className={'mr-2'}>
                {selectedAssetIds.size}/{assets.length}
              </span>
              <Button asChild>
                <Link
                  to={{
                    pathname: 'edit',
                    search: 'ids=' + Array.from(selectedAssetIds.values()).join(',')
                  }}
                  state={{ previousPathname: location.pathname, previousSearch: location.search }}
                >
                  Edytuj
                </Link>
              </Button>
              <AssetDeleteModal
                assetIds={selectedAssetIds}
                onDelete={() => {
                  submit(
                    { ids: Array.from(selectedAssetIds) },
                    {
                      method: 'DELETE',
                      encType: 'application/json'
                    }
                  );
                  setSelectedAssetIds(new Set());
                }}
              />
            </div>
          )}
          <Label
            variant={'horizontal'}
            className={'ml-auto gap-2'}
          >
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
                <SelectOption value={'date_desc'}>Data: od najnowszych</SelectOption>
                <SelectOption value={'date_asc'}>Data: od najstarszych</SelectOption>
                <SelectOption value={'updatedAt_desc'}>Data modyfikacji: od najnowszych</SelectOption>
                <SelectOption value={'updatedAt_asc'}>Data modyfikacji: od najstarszych</SelectOption>
                <SelectOption value={'createdAt_desc'}>Data dodania: od najnowszych</SelectOption>
                <SelectOption value={'createdAt_asc'}>Data dodania: od najstarszych</SelectOption>
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
                linkTo={asset.id.toString()}
                linkState={{ previousPathname: location.pathname, previousSearch: location.search }}
                isSelected={selectedAssetIds.has(asset.id)}
                onSelectedChange={(selected) =>
                  setSelectedAssetIds((prev) => {
                    const newSet = new Set(prev);
                    if (selected) {
                      newSet.add(asset.id);
                    } else {
                      newSet.delete(asset.id);
                    }
                    return newSet;
                  })
                }
              />
            ))}
          </AssetList>
        ) : (
          <div className={'flex items-center justify-center p-4 font-medium text-muted'}>Brak wyników</div>
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
