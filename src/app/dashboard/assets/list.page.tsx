import type { Route } from './+types/list.page';
import { AssetFiltering, assetRepository } from '@/features/assets/.server/assets.repository';
import { Link, Outlet, ShouldRevalidateFunctionArgs, useLocation, useSubmit } from 'react-router';
import { AssetList, AssetListItem } from '@/app/dashboard/assets/_components/asset-list';
import { AssetFilters, parseAssetFilterSearchParams } from '@/app/dashboard/assets/_components/asset-filters';
import { ParamPagination } from '@/components/param-pagination';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { PlusIcon } from '@/components/icons';
import { assetSchema } from '@/features/assets/assets.schemas';
import { z } from '@/lib/zod';
import { assetService } from '@/features/assets/.server/assets.service';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';
import { AssetSortDropdown, parseAssetSortSearchParams } from '@/app/dashboard/assets/_components/asset-sort-dropdown';
import { AssetSelectionTools, useAssetSelection } from '@/app/dashboard/assets/_components/asset-selection-tools';
import { tagRepository } from '@/features/tags/.server/tags.repository';
import { tagSchema } from '@/features/tags/tags.schemas';

const DEFAULT_PAGE_SIZE = 10;

const loaderParamsSchema = z.object({
  page: z.coerce.number().nonnegative().optional().default(0),
  pageSize: z.coerce.number().positive().optional().default(DEFAULT_PAGE_SIZE)
});

export async function loader({ request, context: { logger } }: Route.LoaderArgs) {
  logger.info('Parsing filter params...');
  const [filterParams, parsedParamsOk, parsedParamsError] = await tryAsync(parseAssetFilterSearchParams(request.url));
  if (!parsedParamsOk) {
    logger.error(parsedParamsError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  logger.info('Parsing sort params...');
  const [sortParams, sortParamsOk, sortParamsError] = await tryAsync(parseAssetSortSearchParams(request.url));
  if (!sortParamsOk) {
    logger.error(sortParamsError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  logger.info('Parsing page params...');
  const [pageParams, pageParamsOk, pageParamsError] = await tryAsync(
    loaderParamsSchema.parseAsync(Object.fromEntries(new URL(request.url).searchParams.entries()))
  );
  if (!pageParamsOk) {
    logger.error(pageParamsError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  const filters: AssetFiltering = {
    description: filterParams?.description ?? undefined,
    assetType: filterParams?.assetType ?? undefined,
    dateMin: filterParams?.minYear ?? undefined,
    dateMax: filterParams?.maxYear ?? undefined,
    isPublished: filterParams?.isPublished ?? undefined,
    tagIds: filterParams?.tagIds ?? undefined
  };

  logger.info('Getting asset count...');
  const [assetCount, assetCountOk, assetCountError] = await tryAsync(assetRepository.getAssetCount({ filters }));
  if (!assetCountOk) {
    logger.error(assetCountError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Getting asset stats...');
  const [assetStats, assetStatsOk, assetStatsError] = await tryAsync(assetRepository.getAssetStats());
  if (!assetStatsOk) {
    logger.error(assetStatsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Getting assets...');
  logger.debug({ sortParams });
  const [assets, assetsOk, assetsError] = await tryAsync(
    assetRepository.getAssets({
      pagination: {
        page: pageParams.page,
        pageSize: pageParams.pageSize
      },
      sorting: {
        property: sortParams.sortBy,
        direction: sortParams.sortDir
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
  return { assets, assetCount, assetStats, tags };
}

const assetsDeleteSchema = z.object({
  ids: z.array(assetSchema.shape.id)
});

const addOrRemoveTagFromAssetsSchema = z.object({
  ids: z.array(assetSchema.shape.id),
  tagId: tagSchema.shape.id
});

const setIsPublishedSchema = z.object({
  ids: z.array(assetSchema.shape.id),
  isPublished: z.boolean()
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

  if (intent === 'set_is_published') {
    logger.info('Parsing json data for add tag request...');
    const [data, dataOk, dataError] = await tryAsync(setIsPublishedSchema.parseAsync(jsonData));
    if (!dataOk) {
      logger.error(dataError);
      throw status(StatusCodes.BAD_REQUEST);
    }

    logger.info(`Setting isPublished to "${data.isPublished}" for asset IDs "${data.ids.join(',')}"...`);
    const [, updateAssetOk, updateAssetError] = await tryAsync(
      assetRepository.updateAssets(data.ids, { isPublished: data.isPublished })
    );
    if (!updateAssetOk) {
      logger.error(updateAssetError);
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

export default function AssetListPage({ loaderData: { assets, assetCount, assetStats, tags } }: Route.ComponentProps) {
  const location = useLocation();
  const modalLinkState = { previousPathname: location.pathname, previousSearch: location.search };
  const submit = useSubmit();

  const assetSelection = useAssetSelection(assets);

  return (
    <main className={'flex h-full gap-2'}>
      <div className={'flex flex-col gap-1'}>
        <Button asChild>
          <Link
            to={'upload'}
            state={modalLinkState}
            className={'inline-flex items-center gap-1'}
          >
            <PlusIcon /> <span>Dodaj nową zawartość</span>
          </Link>
        </Button>
        <AssetFilters
          tags={tags}
          yearRangeMin={assetStats.minDate?.getFullYear() ?? undefined}
          yearRangeMax={assetStats.maxDate?.getFullYear() ?? undefined}
        />
      </div>
      <div className={'flex grow flex-col gap-1'}>
        <Card className={'flex items-center gap-2 bg-secondary px-4 py-2 text-secondary-foreground'}>
          <AssetSelectionTools
            assets={assets}
            tags={tags}
            onAddTag={async (assetIds, tagId) => {
              await submit(
                { intent: 'add_tag', ids: assetIds, tagId: tagId },
                {
                  method: 'PUT',
                  encType: 'application/json'
                }
              );
            }}
            onRemoveTag={async (assetIds, tagId) => {
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
            onPublishedChange={async (ids, isPublished) => {
              await submit(
                { intent: 'set_is_published', ids: ids, isPublished: isPublished },
                {
                  method: 'PUT',
                  encType: 'application/json'
                }
              );
            }}
            editPageLinkProps={(selectedIds) => ({
              to: {
                pathname: 'edit',
                search: 'ids=' + Array.from(selectedIds.values()).join(',')
              },
              state: modalLinkState
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
                linkState={modalLinkState}
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
