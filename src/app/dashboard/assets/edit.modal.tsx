import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  redirect
} from 'react-router';
import { assetRepository } from '@/features/assets/assets.repository';
import { useForm } from '@conform-to/react';
import { AssetDatePrecision, assetUpdateSchema } from '@/features/assets/assets.validation';
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
import { assetService } from '@/features/assets/assets.service';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from '@radix-ui/react-dialog';
import { TagSelector } from '@/features/tags/components/tag-selector';
import { tagRepository } from '@/features/tags/tags.repository';
import { getAssetThumbnailUri } from '@/features/assets/utils/uris';
import { status, StatusCodes } from '@/utils/status-response';
import { tryAsync } from '@/utils/try';
import { z } from '@/lib/zod';
import { Asset } from '@/features/assets/components/asset';
import { ClientOnly } from 'remix-utils/client-only';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';

const assetEditFormSchema = assetUpdateSchema
  .pick({
    id: true,
    description: true,
    date: true,
    tagIds: true
  })
  .extend({
    isPublished: z
      .string()
      .transform((isPublished) => isPublished === 'true')
      .pipe(assetUpdateSchema.shape.isPublished)
  });

export async function loader({ params, context: { logger } }: LoaderFunctionArgs) {
  logger.info('Parsing params...');
  const assetId = parseInt(params.id || '');
  if (!assetId) {
    throw status(StatusCodes.NOT_FOUND);
  }

  logger.info(`Getting asset ID "${assetId}"...`);
  const [asset, assetOk, assetError] = await tryAsync(assetRepository.getAssetById(assetId));
  if (!assetOk) {
    logger.error(assetError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  if (!asset) {
    logger.warn('Asset not found.');
    throw status(StatusCodes.NOT_FOUND);
  }

  logger.info('Getting available tags...');
  const [availableTags, availableTagsOk, availableTagsError] = await tryAsync(tagRepository.getAllTags());
  if (!availableTagsOk) {
    logger.error(availableTagsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Success.');
  return { asset, availableTags };
}

export async function action({ request, context: { logger } }: ActionFunctionArgs) {
  logger.info('Parsing form data...');
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: assetEditFormSchema.transform((asset) => {
      if (asset.description === undefined) asset.description = null;
      if (asset.date === undefined) asset.date = null;
      if (asset.tagIds === undefined) asset.tagIds = [];
      return asset;
    }),
    async: true
  });
  if (submission.status !== 'success') {
    logger.warn('Form data validation failed.');
    return { lastResult: submission.reply() };
  }
  logger.info({ data: submission.value }, 'Form data parsed.');

  logger.info('Updating asset...');
  const [, updateAssetOk, updateAssetError] = await tryAsync(assetService.updateAsset(submission.value));
  if (!updateAssetOk) {
    logger.error(updateAssetError);
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }

  logger.info('Success.');
  const callbackUrl = new URL(request.url).searchParams.get('callbackUrl');
  return callbackUrl ? redirect(callbackUrl) : redirect('..');
}

export default function AssetEditModal() {
  const {
    asset: { tags, ...asset },
    availableTags
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const callbackUrl: string = (location.state?.previousPathname ?? '') + (location.state?.previousSearch ?? '');
  const navigateBack = () => navigate(callbackUrl || '..');

  const [form, fields] = useForm({
    lastResult: navigation.state === 'idle' ? actionData?.lastResult || null : null,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: assetEditFormSchema });
      console.log(result);
      return result;
    },
    constraint: getZodConstraint(assetEditFormSchema),
    shouldRevalidate: 'onInput',
    defaultValue: {
      ...asset,
      isPublished: String(asset.isPublished),
      date: asset.date
        ? {
            dateMin: getYYYYMMDD(asset.date.dateMin),
            dateMax: getYYYYMMDD(asset.date.dateMax),
            datePrecision: asset.date.datePrecision,
            dateIsRange: asset.date.dateIsRange
          }
        : undefined
    }
  });

  const dateFieldset = fields.date.getFieldset();

  const [showDatePicker, setShowDatePicker] = useState<boolean>(asset.date !== null);

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
      onOpenChange={(open) => !open && navigateBack()}
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
        <div className={'flex h-60 max-h-60 max-w-full items-start justify-center overflow-hidden'}>
          <ClientOnly>
            {() => (
              <Asset
                assetType={asset.assetType}
                fileName={asset.assetType !== 'image' ? asset.fileName : undefined}
                fullUrl={asset.assetType === 'image' ? getAssetThumbnailUri(asset.fileName) : undefined}
              />
            )}
          </ClientOnly>
        </div>
        <Form
          method={'post'}
          action={`${location.pathname}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex grow flex-col gap-3'}
          state={{ previousPathname: location.state?.previousPathname, previousSearch: location.state?.previousSearch }}
        >
          <InputErrorMessage>{form.errors}</InputErrorMessage>
          <input
            type={'hidden'}
            name={fields.id.name}
            value={fields.id.value}
          />
          <Label className={'w-full'}>
            Opis
            <TextArea
              key={fields.description.key}
              id={fields.description.id}
              name={fields.description.name}
              defaultValue={fields.description.initialValue}
              placeholder={'Opis'}
              className={'h-32 resize-none'}
              maxLength={512}
            />
          </Label>
          <InputErrorMessage>{fields.description.errors}</InputErrorMessage>
          <fieldset className={'flex flex-col gap-1 pt-1'}>
            <Label asChild>
              <legend>Tagi</legend>
            </Label>
            <TagSelector
              allTags={availableTags}
              initialSelectedTags={tags}
              name={fields.tagIds.name}
            />
            <InputErrorMessage>{fields.tagIds.errors}</InputErrorMessage>
          </fieldset>
          <fieldset className={'flex flex-col gap-1 rounded-xl border border-muted p-4 pt-3'}>
            <Label asChild>
              <legend>Data</legend>
            </Label>
            <InputErrorMessage>{fields.date.errors}</InputErrorMessage>
            {datePreview && <span className={'font-medium'}>{datePreview}</span>}
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
          <Label>
            Status publikacji
            <Select
              defaultValue={fields.isPublished.initialValue}
              name={fields.isPublished.name}
            >
              <SelectTrigger className={'w-full'} />
              <SelectContent>
                <SelectOption value={'true'}>Opublikowane</SelectOption>
                <SelectOption value={'false'}>Ukryte</SelectOption>
              </SelectContent>
            </Select>
          </Label>
          <InputErrorMessage>{fields.isPublished.errors}</InputErrorMessage>
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
