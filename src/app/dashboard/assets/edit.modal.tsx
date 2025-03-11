import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { assetRepository } from '@/features/assets/assets.repository';
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation
} from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { AssetDatePrecision, assetUpdateSchema } from '@/features/assets/assets.validation';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Asset } from '@/features/assets/components/asset';
import { Button } from '@/components/base/button';
import { CheckIcon, PencilIcon } from '@/components/icons';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/base/modal';
import { Label } from '@/components/base/label';
import { TextArea } from '@/components/base/text-area';
import { AssetDatePicker } from '@/features/assets/components/asset-date-picker';
import { formatDate } from '@/features/assets/assets.utils';
import { useMemo, useState } from 'react';
import { getYYYYMMDD } from '@/utils/dates';
import { InputErrorMessage } from '@/components/base/input';
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

// export function shouldRevalidate({ }: ShouldRevalidateFunctionArgs) {
//
// }

export default function AssetEditModal() {
  const { asset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

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
          state={{ previousPathname: location.state?.previousPathname, previousSearch: location.state?.previousSearch }}
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
            className={'flex gap-2 bg-green-600'}
          >
            <CheckIcon /> Zatwierdź zmiany
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
