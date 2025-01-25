import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { assetRepository } from '@/features/assets/assets.repository';
import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from '@remix-run/react';
import { useForm, useInputControl } from '@conform-to/react';
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
  console.log('a', submission.value);
  const result = await assetService.updateAsset(submission.value);
  console.log('update result', result);
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
    onValidate: ({ formData }) => {
      const submission = parseWithZod(formData, { schema: assetEditFormSchema });
      console.log(submission);
      return submission;
    },
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
  const dateMinControl = useInputControl(dateFieldset.dateMin);
  const dateMaxControl = useInputControl(dateFieldset.dateMax);
  const datePrecisionControl = useInputControl(dateFieldset.datePrecision);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(asset.date !== null);

  const datePreview = useMemo<string>(() => {
    if (
      !showDatePicker ||
      !dateFieldset.dateMin.value ||
      !dateFieldset.dateMax.value ||
      !dateFieldset.datePrecision.value
    ) {
      return 'Data nieustawiona';
    }

    if (
      dateFieldset.dateMin.value.startsWith('NaN') ||
      dateFieldset.dateMax.value.startsWith('NaN') ||
      dateFieldset.datePrecision.value.startsWith('NaN')
    ) {
      return 'Data nieustawiona';
    }

    return formatDate({
      dateMin: new Date(dateFieldset.dateMin.value),
      dateMax: new Date(dateFieldset.dateMax.value),
      datePrecision: dateFieldset.datePrecision.value as AssetDatePrecision,
      dateIsRange: false
    });
  }, [dateFieldset.dateMin.value, dateFieldset.dateMax.value, dateFieldset.datePrecision.value, showDatePicker]);

  return (
    <ClientOnly>
      {() => (
        <Modal
          onOpenChange={(open) => !open && navigate('..')}
          defaultOpen
        >
          <ModalContent>
            <ModalHeader>
              <ModalTitle className={'flex gap-2'}>
                <PencilIcon /> Edycja zawartości
              </ModalTitle>
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
              <span className={'font-medium'}>{datePreview}</span>
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
                      defaultValue: new Date(dateFieldset.dateMin.initialValue || new Date()),
                      value: new Date(dateMinControl.value || new Date()),
                      onChange: (value) => dateMinControl.change(getYYYYMMDD(value))
                    }}
                    dateMax={{
                      name: dateFieldset.dateMax.name,
                      defaultValue: new Date(dateFieldset.dateMax.initialValue || new Date()),
                      value: new Date(dateMaxControl.value || new Date()),
                      onChange: (value) => dateMaxControl.change(getYYYYMMDD(value))
                    }}
                    datePrecision={{
                      name: dateFieldset.datePrecision.name,
                      defaultValue:
                        (dateFieldset.datePrecision.initialValue as AssetDatePrecision | undefined) || 'day',
                      value: (datePrecisionControl.value as AssetDatePrecision | undefined) || 'year',
                      onChange: (value) => datePrecisionControl.change(value)
                    }}
                  />
                  <Button
                    className={'w-fit'}
                    onClick={() => {
                      setShowDatePicker(false);
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
