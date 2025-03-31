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

const searchParamsSchema = z.object({
  ids: z
    .string()
    .transform((ids) => ids.split(','))
    .pipe(z.array(assetUpdateSchema.shape.id).min(1))
});

const assetEditFormSchema = assetUpdateSchema.pick({
  id: true, // TODO
  description: true,
  date: true,
  tagIds: true
});

export async function loader({ request, context: { logger } }: Route.LoaderArgs) {
  const url = new URL(request.url);

  logger.info('Parsing params...');
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
  return { commonAssetValues, availableTags };
}

// export async function action({ request, context: { logger } }: Route.ActionArgs) {
//   logger.info('Parsing form data...');
//   const formData = await request.formData();
//   const submission = await parseWithZod(formData, {
//     schema: assetEditFormSchema.transform((asset) => {
//       if (asset.description === undefined) asset.description = null;
//       if (asset.date === undefined) asset.date = null;
//       if (asset.tagIds === undefined) asset.tagIds = [];
//       return asset;
//     }),
//     async: true
//   });
//   if (submission.status !== 'success') {
//     logger.warn('Form data validation failed.');
//     return { lastResult: submission.reply() };
//   }
//   logger.info({ data: submission.value }, 'Form data parsed.');
//
//   logger.info('Updating asset...');
//   const [, updateAssetOk, updateAssetError] = await tryAsync(assetService.updateAsset(submission.value));
//   if (!updateAssetOk) {
//     logger.error(updateAssetError);
//     return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
//   }
//
//   logger.info('Success.');
//   return { lastResult: submission.reply({ resetForm: true }) };
// }

export default function AssetEditModal({
  loaderData: {
    commonAssetValues: { tags, ...commonAssetValues },
    availableTags
  },
  actionData
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const [form, fields] = useForm({
    // lastResult: navigation.state === 'idle' ? actionData?.lastResult || null : null,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: assetEditFormSchema });
      console.log(result);
      return result;
    },
    constraint: getZodConstraint(assetEditFormSchema),
    shouldRevalidate: 'onInput',
    defaultValue: {
      ...commonAssetValues,
      date: commonAssetValues.date
        ? {
            id: commonAssetValues.date.id,
            dateMin: getYYYYMMDD(commonAssetValues.date.dateMin),
            dateMax: getYYYYMMDD(commonAssetValues.date.dateMax),
            datePrecision: commonAssetValues.date.datePrecision,
            dateIsRange: commonAssetValues.date.dateIsRange
          }
        : undefined
    }
  });

  const dateFieldset = fields.date.getFieldset();

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
            <PencilIcon /> Edycja zawartości
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
          <input
            type={'hidden'}
            name={fields.id.name}
            value={fields.id.value}
          />
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
          <div
            role={'group'}
            className={'flex flex-col gap-1'}
          >
            <Label asChild>
              <legend className={'appearance-none'}>Tagi</legend>
            </Label>
            <TagSelector
              allTags={availableTags}
              initialSelectedTags={tags}
              name={fields.tagIds.name}
            />
          </div>
          <Label>Data</Label>
          <InputErrorMessage>{fields.date.errors}</InputErrorMessage>
          {datePreview && <span className={'font-medium'}>{datePreview}</span>}
          <AssetDatePicker
            enabled={showDatePicker}
            onEnabledChange={setShowDatePicker}
            id={{
              name: dateFieldset.id.name,
              value: dateFieldset.id.value
            }}
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
          <Button
            type={'submit'}
            variant={'success'}
            className={'flex gap-2'}
            disabled={navigation.state !== 'idle'}
          >
            <CheckIcon /> Zatwierdź zmiany
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
