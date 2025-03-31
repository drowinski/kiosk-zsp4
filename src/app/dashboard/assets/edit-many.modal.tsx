import type { Route } from './+types/edit-many.modal';
import { Form, useLocation, useNavigate, useNavigation } from 'react-router';
import { assetRepository } from '@/features/assets/assets.repository';
import { useForm } from '@conform-to/react';
import { Asset, AssetDatePrecision, assetUpdateSchema } from '@/features/assets/assets.validation';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Button } from '@/components/base/button';
import { CheckIcon, PencilIcon } from '@/components/icons';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/base/modal';
import { Label } from '@/components/base/label';
import { TextArea } from '@/components/base/text-area';
import { AssetDatePicker } from '@/features/assets/components/asset-date-picker';
import { formatDate } from '@/features/assets/utils/dates';
import { useMemo, useState } from 'react';
import { getYYYYMMDD } from '@/utils/dates';
import { InputErrorMessage } from '@/components/base/input';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from '@radix-ui/react-dialog';
import { TagSelector } from '@/features/tags/components/tag-selector';
import { tagRepository } from '@/features/tags/tags.repository';
import { status, StatusCodes } from '@/utils/status-response';
import { tryAsync } from '@/utils/try';
import { z } from '@/lib/zod';
import { Checkbox } from '@/components/base/checkbox';
import { applyDeclension } from '@/utils/language';
import { assetService } from '@/features/assets/assets.service';

const searchParamsSchema = z.object({
  ids: z
    .string()
    .transform((ids) => ids.split(','))
    .pipe(z.array(assetUpdateSchema.shape.id).min(1))
});

const assetEditManyFormSchema = assetUpdateSchema
  .pick({
    description: true,
    date: true,
    tagIds: true
  })
  .partial({
    description: true,
    date: true,
    tagIds: true
  })
  .extend({
    editDescription: z.boolean().default(false),
    editDate: z.boolean().default(false),
    editTags: z.boolean().default(false)
  });

export async function loader({ request, context: { logger } }: Route.LoaderArgs) {
  logger.info('Parsing params...');
  const url = new URL(request.url);
  const [parsedParams, parsedParamsOk, parsedParamsError] = await tryAsync(
    searchParamsSchema.parseAsync(Object.fromEntries(url.searchParams.entries()))
  );
  if (!parsedParamsOk) {
    logger.error(parsedParamsError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  logger.info(`Getting assets with IDs: "${parsedParams.ids.join(',')}"...`);
  const [assets, assetsOk, assetsError] = await tryAsync(assetRepository.getAssetsByIds(...parsedParams.ids));
  if (!assetsOk) {
    logger.error(assetsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  if (assets.length < parsedParams.ids.length) {
    logger.warn('Found fewer assets than the amount of provided IDs.');
    throw status(StatusCodes.NOT_FOUND);
  }

  logger.info('Finding common values between assets...');
  const commonAssetValues: Partial<Asset> = assets.reduce(
    (common, asset, index) => {
      if (index === 0) return common;
      if (common.description !== asset.description) common.description = null;
      if (
        common.date !== null &&
        (asset.date === null ||
          common.date?.dateMin.getTime() !== asset.date?.dateMin.getTime() ||
          common.date?.dateMax.getTime() !== asset.date?.dateMax.getTime() ||
          common.date?.datePrecision !== asset.date?.datePrecision)
      ) {
        common.date = null;
      }
      if (common.tags.length > 0) {
        common.tags = common.tags.filter((tagA) => asset.tags.some((tagB) => tagA.id === tagB.id));
      }

      return common;
    },
    {
      description: assets.at(0)?.description ?? null,
      date: assets.at(0)?.date ?? null,
      tags: assets.at(0)?.tags ?? []
    }
  );

  logger.info('Getting available tags...');
  const [availableTags, availableTagsOk, availableTagsError] = await tryAsync(tagRepository.getAllTags());
  if (!availableTagsOk) {
    logger.error(availableTagsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Success.');
  return { commonAssetValues, availableTags, assetIds: parsedParams.ids };
}

export async function action({ request, context: { logger } }: Route.ActionArgs) {
  logger.info('Parsing params...');
  const url = new URL(request.url);
  const [parsedParams, parsedParamsOk, parsedParamsError] = await tryAsync(
    searchParamsSchema.parseAsync(Object.fromEntries(url.searchParams.entries()))
  );
  if (!parsedParamsOk) {
    logger.error(parsedParamsError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  logger.info('Parsing form data...');
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: assetEditManyFormSchema.transform((form) => {
      return {
        ...(form.editDescription && { description: form.description ?? null }),
        ...(form.editDate && { date: form.date ?? null }),
        ...(form.editTags && { tagIds: form.tagIds ?? [] })
      };
    }),
    async: true
  });
  if (submission.status !== 'success') {
    logger.warn('Form data validation failed.');
    return { lastResult: submission.reply() };
  }

  logger.info(
    {
      ids: parsedParams.ids,
      updatedValues: submission.value
    },
    `Updating assets with IDs: "${parsedParams.ids.join(',')}"...`
  );
  const [, updateAssetsOk, updateAssetsError] = await tryAsync(
    assetService.updateAssets(parsedParams.ids, submission.value)
  );
  if (!updateAssetsOk) {
    logger.error(updateAssetsError);
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }

  logger.info('Success.');
  return { lastResult: submission.reply({ resetForm: true }) };
}

export default function AssetEditModal({
  loaderData: {
    commonAssetValues: { tags, ...commonAssetValues },
    availableTags,
    assetIds
  },
  actionData
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const [form, fields] = useForm({
    // lastResult: navigation.state === 'idle' ? actionData?.lastResult || null : null,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: assetEditManyFormSchema });
      console.log(result);
      return result;
    },
    constraint: getZodConstraint(assetEditManyFormSchema),
    shouldRevalidate: 'onInput',
    defaultValue: {
      ...commonAssetValues,
      date: commonAssetValues.date
        ? {
            dateMin: getYYYYMMDD(commonAssetValues.date.dateMin),
            dateMax: getYYYYMMDD(commonAssetValues.date.dateMax),
            datePrecision: commonAssetValues.date.datePrecision,
            dateIsRange: commonAssetValues.date.dateIsRange
          }
        : undefined
    }
  });

  const dateFieldset = fields.date.getFieldset();

  const [isDescriptionEnabled, setIsDescriptionEnabled] = useState<boolean>(false);
  const [areTagsEnabled, setAreTagsEnabled] = useState<boolean>(false);
  const [isDateEnabled, setIsDateEnabled] = useState<boolean>(false);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(commonAssetValues.date !== null);

  const [dateMin, setDateMin] = useState<string>(dateFieldset.dateMin.initialValue || '');
  const [dateMax, setDateMax] = useState<string>(dateFieldset.dateMax.initialValue || '');
  const [datePrecision, setDatePrecision] = useState<AssetDatePrecision>(
    (dateFieldset.datePrecision.initialValue as AssetDatePrecision | undefined) || 'day'
  );

  const datePreview = useMemo(
    () =>
      showDatePicker && dateMin.length > 0 && dateMax.length > 0
        ? formatDate({
            dateMin: new Date(dateMin),
            dateMax: new Date(dateMax),
            datePrecision: datePrecision,
            dateIsRange: false
          })
        : undefined,
    [showDatePicker, dateMin, dateMax, datePrecision]
  );

  return (
    <Modal
      onOpenChange={(open) =>
        !open && navigate(location.state?.previousPathname + location.state?.previousSearch || '..')
      }
      defaultOpen
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle className={'flex gap-2'}>
            <PencilIcon /> Edycja {assetIds.length}{' '}
            {applyDeclension(assetIds.length, 'materiału', 'materiałów', 'materiałów')}
          </ModalTitle>
          <VisuallyHidden>
            <DialogDescription>Edycja metadanych zawartości multimedialnej</DialogDescription>
          </VisuallyHidden>
        </ModalHeader>
        {/*<div className={'flex max-h-60 max-w-full items-start justify-center'}>*/}
        {/*  <Asset*/}
        {/*    assetType={asset.assetType}*/}
        {/*    fileName={asset.assetType !== 'image' ? asset.fileName : undefined}*/}
        {/*    fullUrl={asset.assetType === 'image' ? getAssetThumbnailUri(asset.fileName) : undefined}*/}
        {/*  />*/}
        {/*</div>*/}
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex grow flex-col gap-2'}
          state={{ previousPathname: location.state?.previousPathname, previousSearch: location.state?.previousSearch }}
        >
          <InputErrorMessage>{form.errors}</InputErrorMessage>
          <fieldset className={'flex gap-4 py-2'}>
            <Label asChild>
              <legend>Edytowane pola</legend>
            </Label>
            <Label variant={'horizontal'}>
              <Checkbox
                name={fields.editDescription.name}
                checked={isDescriptionEnabled}
                onCheckedChange={(checked) => setIsDescriptionEnabled(checked === true)}
              />
              Opis
            </Label>
            <Label variant={'horizontal'}>
              <Checkbox
                name={fields.editTags.name}
                checked={areTagsEnabled}
                onCheckedChange={(checked) => setAreTagsEnabled(checked === true)}
              />
              Tagi
            </Label>
            <Label variant={'horizontal'}>
              <Checkbox
                name={fields.editDate.name}
                checked={isDateEnabled}
                onCheckedChange={(checked) => setIsDateEnabled(checked === true)}
              />
              Data
            </Label>
          </fieldset>
          <div
            className={'flex flex-col gap-1'}
            hidden={!isDescriptionEnabled}
          >
            <Label htmlFor={fields.description.id}>Opis</Label>
            <TextArea
              key={fields.description.key}
              id={fields.description.id}
              name={fields.description.name}
              defaultValue={fields.description.initialValue}
              placeholder={'Opis'}
              className={'h-32 resize-none'}
              maxLength={512}
            />
          </div>
          <fieldset
            className={'flex flex-col gap-1 pt-1'}
            hidden={!areTagsEnabled}
          >
            <Label asChild>
              <legend>Tagi</legend>
            </Label>
            <TagSelector
              allTags={availableTags}
              initialSelectedTags={tags}
              name={fields.tagIds.name}
            />
          </fieldset>
          <fieldset
            className={'flex flex-col gap-1 pt-1'}
            hidden={!isDateEnabled}
          >
            <Label asChild>
              <legend>Data</legend>
            </Label>
            <InputErrorMessage>{fields.date.errors}</InputErrorMessage>
            <span className={'font-medium'}>
              {datePreview ? datePreview : 'Istniejące daty zostaną usunięte z wybranych materiałów!'}
            </span>
            <AssetDatePicker
              enabled={showDatePicker}
              onEnabledChange={setShowDatePicker}
              dateMin={{
                name: dateFieldset.dateMin.name,
                value: dateFieldset.dateMin.value,
                onValueChange: (value) => setDateMin(value)
              }}
              dateMax={{
                name: dateFieldset.dateMax.name,
                value: dateFieldset.dateMax.value,
                onValueChange: (value) => setDateMax(value)
              }}
              datePrecision={{
                name: dateFieldset.datePrecision.name,
                value: dateFieldset.datePrecision.initialValue as AssetDatePrecision | undefined,
                onValueChange: (value) => setDatePrecision(value)
              }}
            />
          </fieldset>
          <Button
            type={'submit'}
            variant={'success'}
            className={'flex gap-2'}
            disabled={(!isDescriptionEnabled && !areTagsEnabled && !isDateEnabled) || navigation.state !== 'idle'}
          >
            <CheckIcon /> Zatwierdź zmiany
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
