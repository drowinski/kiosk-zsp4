import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { assetRepository } from '@/features/assets/assets.repository';
import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { AssetDatePrecision, assetUpdateSchema } from '@/features/assets/assets.validation';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Asset } from '@/features/assets/components/asset';
import { Button } from '@/components/base/button';
import { CheckIcon, PencilIcon } from '@/components/icons';
import { ClientOnly } from 'remix-utils/client-only';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/base/modal';
import { Label } from '@/components/base/label';
import { TextArea } from '@/components/base/text-area';
import { AssetDatePicker } from '@/features/assets/components/asset-date-picker';
import { formatDate } from '@/features/assets/assets.utils';
import { useMemo, useState } from 'react';
import { getYYYYMMDD } from '@/utils/dates';
import { InputMessage } from '@/components/base/input';
import { assetService } from '@/features/assets/assets.service';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from '@radix-ui/react-dialog';

const assetEditFormSchema = assetUpdateSchema.pick({
  id: true,
  description: true,
  date: true
});

export async function loader({ params }: LoaderFunctionArgs) {
  const assetId = parseInt(params.id || '');
  if (!assetId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const asset = await assetRepository.getAssetById(assetId);
  if (!asset) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  return { asset };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: assetEditFormSchema, async: true });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  if (!submission.value.date) {
    submission.value.date = null;
  }
  const result = await assetService.updateAsset(submission.value);
  if (!result) {
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }

  return { lastResult: submission.reply({ resetForm: true }) };
}

export default function AssetEditModal() {
  const { asset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult: navigation.state === 'idle' ? actionData?.lastResult || null : null,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: assetEditFormSchema }),
    constraint: getZodConstraint(assetEditFormSchema),
    shouldRevalidate: 'onInput',
    defaultValue: {
      ...asset,
      date: asset.date
        ? {
            id: asset.date.id,
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
      dateMin.length > 0 && dateMax.length > 0
        ? formatDate({
            dateMin: new Date(dateMin),
            dateMax: new Date(dateMax),
            datePrecision: datePrecision,
            dateIsRange: false
          })
        : undefined,
    [dateMin, dateMax, datePrecision]
  );

  return (
    <ClientOnly>
      {() => (
        <Modal
          onOpenChange={(open) => !open && navigate(-1)}
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
            <div className={'flex max-h-60 max-w-full items-start justify-center'}>
              <Asset
                assetType={asset.assetType}
                fileName={asset.fileName}
              />
            </div>
            <Form
              method={'post'}
              id={form.id}
              onSubmit={form.onSubmit}
              noValidate
              className={'flex grow flex-col gap-2'}
            >
              <input
                type={'hidden'}
                name={fields.id.name}
                value={fields.id.value}
              />
              <Label htmlFor={fields.description.name}>Opis</Label>
              <TextArea
                key={fields.description.key}
                name={fields.description.name}
                defaultValue={fields.description.initialValue}
                placeholder={'Opis'}
                className={'h-32 resize-none'}
                maxLength={512}
              />
              <Label>Data</Label>
              <InputMessage>{fields.date.errors}</InputMessage>
              {datePreview && <span className={'font-medium'}>{datePreview}</span>}
              {showDatePicker ? (
                <>
                  <input
                    type={'hidden'}
                    name={dateFieldset.id.name}
                    value={dateFieldset.id.value}
                  />
                  <AssetDatePicker
                    dateMin={{
                      name: dateFieldset.dateMin.name,
                      defaultValue: dateFieldset.dateMin.initialValue,
                      onChange: (value) => setDateMin(value)
                    }}
                    dateMax={{
                      name: dateFieldset.dateMax.name,
                      defaultValue: dateFieldset.dateMax.initialValue,
                      onChange: (value) => setDateMax(value)
                    }}
                    datePrecision={{
                      name: dateFieldset.datePrecision.name,
                      defaultValue: dateFieldset.datePrecision.initialValue as AssetDatePrecision | undefined,
                      onChange: (value) => setDatePrecision(value)
                    }}
                  />
                  <Button
                    className={'w-fit'}
                    onClick={() => {
                      setShowDatePicker(false);
                      setDateMin('');
                      setDateMax('');
                      setDatePrecision('day');
                    }}
                  >
                    Usuń datę
                  </Button>
                </>
              ) : (
                <Button
                  variant={'secondary'}
                  className={'w-fit'}
                  onClick={() => {
                    setShowDatePicker(true);
                  }}
                >
                  Dodaj datę
                </Button>
              )}
              <Button
                type={'submit'}
                className={'flex gap-2 bg-green-600'}
              >
                <CheckIcon /> Zatwierdź zmiany
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </ClientOnly>
  );
}
