import { formatCaption } from '@/features/timeline/utils/strings';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Input, InputErrorMessage } from '@/components/base/input';
import { getYYYYMMDD } from '@/utils/dates';
import { TimelineRange, updateTimelineRangeSchema } from '@/features/timeline/timeline.validation';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { SubmissionResult, useForm, useInputControl } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Asset } from '@/features/assets/assets.validation';
import { Button } from '@/components/base/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';
import { cn } from '@/utils/styles';
import { getAssetThumbnailUri } from '@/features/assets/utils/uris';
import { Label } from '@/components/base/label';

const updateTimelineRangeForm = updateTimelineRangeSchema;

export async function loader({ params }: LoaderFunctionArgs) {
  const timelineRangeId = parseInt(params.id || '');
  if (!timelineRangeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const timelineRange = await timelineRepository.getTimelineRangeById(timelineRangeId);
  if (!timelineRange) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const assets = await timelineRepository.getAllAssetsInTimelineRangeById(timelineRangeId);
  return { timelineRange, assets };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: updateTimelineRangeForm.transform((timelineRange) => {
      if (timelineRange.minDate === undefined) timelineRange.minDate = null;
      if (timelineRange.maxDate === undefined) timelineRange.maxDate = null;
      if (timelineRange.caption === undefined) timelineRange.caption = null;
      return timelineRange;
    }),
    async: true
  });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  try {
    await timelineRepository.updateTimelineRange(submission.value);
  } catch (_error) {
    const error = _error as { code: string };
    let errorMessage = 'Wystąpił błąd.';
    if (error?.code === '23P01') {
      errorMessage = 'Źle ustawione daty! Daty nie mogą pokrywać się z innym okresem.';
    }
    return { lastResult: submission.reply({ formErrors: [errorMessage] }) };
  }
  return { lastResult: submission.reply() };
}

export default function TimelineRangeEditPage() {
  const { timelineRange, assets } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className={'flex flex-col gap-1'}>
      <h3 className={'text-xl font-bold'}>{formatCaption(timelineRange)}</h3>
      <TimelineRangeEditForm
        key={timelineRange.id}
        timelineRange={timelineRange}
        assets={assets}
        lastResult={actionData?.lastResult}
      />
    </div>
  );
}

interface TimelineRangeEditFormProps {
  timelineRange: TimelineRange;
  assets: Asset[];
  lastResult: SubmissionResult | undefined;
}

export function TimelineRangeEditForm({ timelineRange, assets, lastResult }: TimelineRangeEditFormProps) {
  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: updateTimelineRangeForm });
      console.log(result);
      return result;
    },
    defaultValue: {
      id: timelineRange.id,
      minDate: timelineRange.minDate ? getYYYYMMDD(timelineRange.minDate) : '',
      maxDate: timelineRange.maxDate ? getYYYYMMDD(timelineRange.maxDate) : '',
      caption: timelineRange.caption,
      coverAssetId: timelineRange.coverAsset?.id
    }
  });

  const coverAssetIdControl = useInputControl(fields.coverAssetId);
  const coverAsset = assets.find((asset) => asset.id.toString() === coverAssetIdControl.value);

  return (
    <Form
      method={'post'}
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate
      className={'flex gap-1 w-52'}
    >
      <div className={'flex flex-col gap-1 grow'}>
        <InputErrorMessage>{form.errors}</InputErrorMessage>
        <Input
          type={'hidden'}
          name={fields.id.name}
          defaultValue={fields.id.value}
          readOnly
        />
        <Label className={'w-full'}>
          Data początkowa
          <Input
            type={'date'}
            name={fields.minDate.name}
            defaultValue={fields.minDate.initialValue}
            className={'w-full'}
          />
        </Label>
        <InputErrorMessage>{fields.minDate.errors}</InputErrorMessage>
        <Label className={'w-full'}>
          Data końcowa
          <Input
            type={'date'}
            name={fields.maxDate.name}
            defaultValue={fields.maxDate.initialValue}
            className={'w-full'}
          />
        </Label>
        <InputErrorMessage>{fields.maxDate.errors}</InputErrorMessage>
        <Label className={'w-full'}>
          Podpis (opcjonalne)
          <Input
            placeholder={'Podpis...'}
            name={fields.caption.name}
            defaultValue={fields.caption.initialValue}
            className={'w-full'}
          />
        </Label>
        <InputErrorMessage>{fields.caption.errors}</InputErrorMessage>
        <Input
          type={'hidden'}
          name={fields.coverAssetId.name}
          value={coverAssetIdControl.value}
          readOnly
        />
        <Modal>
          <ModalTrigger asChild>
            <Button variant={'secondary'}>Wybierz okładkę</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Wybierz okładkę</ModalTitle>
            </ModalHeader>
            <GalleryGrid>
              {assets.map((asset) => (
                <GalleryGridItem
                  key={asset.id}
                  asset={asset}
                  role={'button'}
                  tabIndex={0}
                  onClick={() => coverAssetIdControl.change(asset.id.toString())}
                  className={'transition-all duration-150 hover:scale-105 active:scale-100'}
                />
              ))}
            </GalleryGrid>
          </ModalContent>
        </Modal>
        <Button
          type={'submit'}
          variant={'success'}
        >
          Zatwierdź zmiany
        </Button>
      </div>
      {coverAsset && (
        <div className={cn('relative aspect-[3/4] h-full rounded-xl border-8 border-secondary bg-secondary shadow-md')}>
            <img
              src={getAssetThumbnailUri(coverAsset.fileName)}
              alt={'okładka'}
              className={'h-full w-full rounded-lg object-cover'}
            />
        </div>
      )}
    </Form>
  );
}
