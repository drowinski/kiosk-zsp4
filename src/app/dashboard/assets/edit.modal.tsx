import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { assetRepository } from '@/features/assets/assets.repository';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { useForm, useInputControl } from '@conform-to/react';
import { assetCreateSchema, assetDateCreateSchema, AssetDatePrecision } from '@/features/assets/assets.validation';
import { parseWithZod } from '@conform-to/zod';
import { Asset } from '@/features/assets/components/asset';
import { Button } from '@/components/base/button';
import { CheckIcon, PencilIcon } from '@/components/icons';
import { ClientOnly } from 'remix-utils/client-only';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/base/modal';
import { Label } from '@/components/base/label';
import { TextArea } from '@/components/base/text-area';
import { AssetDatePicker } from '@/features/assets/components/asset-date-picker';
import { formatDate } from '@/features/assets/assets.utils';
import { useMemo } from 'react';
import { getYYYYMMDD } from '@/utils/dates';

const assetEditFormSchema = assetCreateSchema
  .pick({
    description: true
  })
  .extend({ date: assetDateCreateSchema });

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
  console.log('test');
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: assetEditFormSchema });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  console.log(submission.value.description);
  return { lastResult: submission.reply() };
}

export default function AssetEditModal() {
  const { asset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: assetEditFormSchema });
      console.log(result);
      return result;
    },
    defaultValue: {
      ...asset,
      date: asset.date || {
        dateMin: new Date(),
        dateMax: new Date(),
        datePrecision: 'day',
        dateIsRange: false
      }
    }
  });

  const dateFieldset = fields.date.getFieldset();
  const dateMinControl = useInputControl(dateFieldset.dateMin);
  const dateMaxControl = useInputControl(dateFieldset.dateMax);
  const datePrecisionControl = useInputControl(dateFieldset.datePrecision);

  const datePreview = useMemo<string>(() => {
    console.log('datePreview', dateMinControl.value, dateMaxControl.value, datePrecisionControl.value);
    if (!dateMinControl.value || !dateMaxControl.value || !datePrecisionControl.value) {
      return 'Data nieustawiona';
    }

    return formatDate({
      dateMin: new Date(dateMinControl.value),
      dateMax: new Date(dateMaxControl.value),
      datePrecision: datePrecisionControl.value as AssetDatePrecision,
      dateIsRange: false
    });
  }, [dateMinControl.value, dateMaxControl.value, datePrecisionControl.value]);

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
            <Form
              method={'post'}
              id={form.id}
              onSubmit={form.onSubmit}
              noValidate
              className={'flex grow flex-col gap-2'}
            >
              <div className={'flex max-h-60 max-w-full items-start justify-center'}>
                <Asset
                  assetType={asset.assetType}
                  fileName={asset.fileName}
                />
              </div>
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
              <span className={'pl-2 font-medium'}>{datePreview}</span>
              <AssetDatePicker
                dateMin={{
                  defaultValue: new Date(dateFieldset.dateMin.initialValue || new Date()),
                  value: new Date(dateMinControl.value || new Date()),
                  onChange: (value) => dateMinControl.change(getYYYYMMDD(value))
                }}
                dateMax={{
                  defaultValue: new Date(dateFieldset.dateMax.initialValue || new Date()),
                  value: new Date(dateMaxControl.value || new Date()),
                  onChange: (value) => dateMaxControl.change(getYYYYMMDD(value))
                }}
                datePrecision={{
                  defaultValue: (dateFieldset.datePrecision.initialValue as AssetDatePrecision | undefined) || 'day',
                  value: (datePrecisionControl.value as AssetDatePrecision | undefined) || 'day',
                  onChange: (value) => datePrecisionControl.change(value)
                }}
              />
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
