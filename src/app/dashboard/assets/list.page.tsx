import type { Route } from './+types/list.page';
import { AssetFiltering, assetRepository } from '@/features/assets/assets.repository';
import { Link, Outlet, ShouldRevalidateFunctionArgs, useLocation, useSubmit } from 'react-router';
import { AssetList, AssetListItem } from '@/app/dashboard/assets/_components/asset-list';
import { AssetFilters } from '@/app/dashboard/assets/_components/asset-filters';
import { ParamPagination } from '@/components/param-pagination';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { PlusIcon } from '@/components/icons';
import { assetSchema } from '@/features/assets/assets.validation';
import { z } from '@/lib/zod';
import { assetService } from '@/features/assets/assets.service';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';
import { AssetSortDropdown } from '@/app/dashboard/assets/_components/asset-sort-dropdown';
import { AssetSelectionTools, useAssetSelection } from '@/app/dashboard/assets/_components/asset-selection-tools';
import { tagRepository } from '@/features/tags/tags.repository';
import { tagSchema } from '@/features/tags/tags.validation';

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

  logger.info('Getting tags...');
  const [tags, tagsOk, tagsError] = await tryAsync(tagRepository.getAllTags());
  if (!tagsOk) {
    logger.error(tagsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Success.');
  return { assets, assetCount, tags };
}

const addOrRemoveTagFromAssetsSchema = z.object({
  ids: z.array(assetSchema.shape.id),
  tagId: tagSchema.shape.id
});

const assetsDeleteSchema = z.object({
  ids: z.array(assetSchema.shape.id)
});

export async function action({ request, context: { logger } }: Route.ActionArgs) {
  logger.info('Parsing intent...');
  const jsonData = await request.json();
  const intent: string = jsonData.intent;

  if (request.method === 'DELETE') {
    logger.info('Parsing json data for delete request...');
    const [data, dataOk, dataError] = await tryAsync(assetsDeleteSchema.parseAsync(jsonData));
    if (!dataOk) {
      logger.error(dataError);
      throw status(StatusCodes.BAD_REQUEST);
    }

    logger.info('Deleting assets...');
    const [, deleteAssetsOk, deleteAssetsError] = await tryAsync(assetService.deleteAssets(...data.ids));
    if (!deleteAssetsOk) {
      logger.error(deleteAssetsError);
      throw status(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    logger.info('Success.');
    return status(StatusCodes.NO_CONTENT);
  }

  if (intent === 'add_tag') {
    logger.info('Parsing json data for add tag request...');
    const [data, dataOk, dataError] = await tryAsync(addOrRemoveTagFromAssetsSchema.parseAsync(jsonData));
    if (!dataOk) {
      logger.error(dataError);
      throw status(StatusCodes.BAD_REQUEST);
    }
    logger.info(`Adding tag ID "${data.tagId}" to asset IDs "${data.ids.join(',')}"....`);
    const [, addTagOk, addTagError] = await tryAsync(tagRepository.addTagToAssets(data.tagId, ...data.ids));
    if (!addTagOk) {
      logger.error(addTagError);
      throw status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    logger.info('Success.');
    return status(StatusCodes.NO_CONTENT);
  }

  if (intent === 'remove_tag') {
    logger.info('Parsing json data for add tag request...');
    const [data, dataOk, dataError] = await tryAsync(addOrRemoveTagFromAssetsSchema.parseAsync(jsonData));
    if (!dataOk) {
      logger.error(dataError);
      throw status(StatusCodes.BAD_REQUEST);
    }
    logger.info(`Removing tag ID "${data.tagId}" from asset IDs "${data.ids.join(',')}"....`);
    const [, addTagOk, addTagError] = await tryAsync(tagRepository.removeTagFromAssets(data.tagId, ...data.ids));
    if (!addTagOk) {
      logger.error(addTagError);
      throw status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    logger.info('Success.');
    return status(StatusCodes.NO_CONTENT);
  }

  return null;
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

export default function AssetListPage({ loaderData: { assets, assetCount, tags } }: Route.ComponentProps) {
  const location = useLocation();
  const submit = useSubmit();

  const assetSelection = useAssetSelection(assets);

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
          <AssetSelectionTools
            assets={assets}
            tags={tags}
            onAddTag={async (assetIds, tagId) => {
              console.log(`Add tag ${tagId} to ${assetIds.join(',')}.`);
              await submit(
                { intent: 'add_tag', ids: assetIds, tagId: tagId },
                {
                  method: 'PUT',
                  encType: 'application/json'
                }
              );
            }}
            onRemoveTag={async (assetIds, tagId) => {
              console.log(`Remove tag ${tagId} from ${assetIds.join(',')}.`);
              await submit(
                { intent: 'remove_tag', ids: assetIds, tagId: tagId },
                {
                  method: 'PUT',
                  encType: 'application/json'
                }
              );
            }}
            onDelete={async (ids) => {
              await submit(
                { ids: Array.from(ids) },
                {
                  method: 'DELETE',
                  encType: 'application/json'
                }
              );
              assetSelection.unselectAllAssets();
            }}
            editPageLinkProps={(selectedIds) => ({
              to: {
                pathname: 'edit',
                search: 'ids=' + Array.from(selectedIds.values()).join(',')
              },
              state: { previousPathname: location.pathname, previousSearch: location.search }
            })}
            {...assetSelection}
          />
          <Label
            variant={'horizontal'}
            className={'ml-auto gap-2'}
            hidden={assetSelection.selectedIds.size > 0}
          >
            Sortowanie
            <AssetSortDropdown />
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
                isSelected={assetSelection.selectedIds.has(asset.id)}
                onSelectedChange={(selected) => {
                  if (selected) {
                    assetSelection.selectAsset(asset.id);
                  } else {
                    assetSelection.unselectAsset(asset.id);
                  }
                }}
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
