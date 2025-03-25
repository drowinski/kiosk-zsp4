import { formatCaption } from '@/features/timeline/utils/strings';
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect
} from 'react-router';
import { Input, InputErrorMessage } from '@/components/base/input';
import { getYYYYMMDD } from '@/utils/dates';
import { TimelineRange, timelineRangeSchema, updateTimelineRangeSchema } from '@/features/timeline/timeline.validation';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { SubmissionResult, useForm, useInputControl } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Asset } from '@/features/assets/assets.validation';
import { Button } from '@/components/base/button';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';
import { cn } from '@/utils/styles';
import { getAssetThumbnailUri } from '@/features/assets/utils/uris';
import { Label } from '@/components/base/label';
import { useState } from 'react';
import { TimelineRangeDeleteModal } from '@/app/dashboard/settings/timeline/_components/timeline-range-delete-modal';
import { CheckIcon } from '@/components/icons';

const updateTimelineRangeFormSchema = updateTimelineRangeSchema;

export async function loader({ params }: LoaderFunctionArgs) {
  const timelineRangeId = parseInt(params.id || '');
  if (!timelineRangeId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const timelineRange = await timelineRepository.getTimelineRangeById(timelineRangeId);
  if (!timelineRange) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const assets = await timelineRepository.getAssetsByTimelineRangeId(timelineRangeId);
  return { timelineRange, assets };
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method === 'POST') {
    const formData = await request.formData();
    const submission = await parseWithZod(formData, {
      schema: updateTimelineRangeFormSchema.transform((timelineRange) => {
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
        errorMessage = 'Daty nie mogą pokrywać się z datami innego okresu.';
      }
      return { lastResult: submission.reply({ formErrors: [errorMessage] }) };
    }
    return { lastResult: submission.reply() };
  } else if (request.method === 'DELETE') {
    const { data: timelineRangeId } = await timelineRangeSchema.shape.id.safeParseAsync(params.id);
    if (!timelineRangeId) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    }
    await timelineRepository.deleteTimelineRange(timelineRangeId);
    return redirect(new URL(request.url).pathname.replace(/\/[^/]*$/, `/new`));
  } else {
    return null;
  }
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
  const submit = useSubmit();

  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: updateTimelineRangeFormSchema });
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
  const [isCoverAssetModalOpen, setIsCoverAssetModalOpen] = useState(false);

  return (
    <Form
      method={'post'}
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate
      className={'flex w-52 gap-1'}
    >
      <div className={'flex grow flex-col gap-1'}>
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
        <Button
          type={'submit'}
          variant={'success'}
          disabled={!form.dirty}
          className={'gap-1'}
        >
          <CheckIcon /> <span>Zatwierdź zmiany</span>
        </Button>
        <TimelineRangeDeleteModal
          timelineRangeId={timelineRange.id}
          onDelete={() => submit(null, { method: 'DELETE' })}
          triggerClassName={'w-full'}
        />
      </div>
      <Modal
        open={isCoverAssetModalOpen}
        onOpenChange={setIsCoverAssetModalOpen}
      >
        <ModalTrigger asChild>
          <Button
            className={cn(
              'group relative aspect-[3/4] h-full rounded-xl p-0',
              'border-8 border-secondary bg-secondary text-secondary-foreground shadow-md'
            )}
            aria-label={
              coverAsset
                ? `Zmień okładkę. Opis obecnej okładki: ${coverAsset.description || 'brak opisu'}`
                : 'Ustaw okładkę.'
            }
            disabled={assets.length === 0}
          >
            {coverAsset ? (
              <img
                src={getAssetThumbnailUri(coverAsset.fileName)}
                alt={'okładka'}
                className={'h-full w-full rounded-lg object-cover'}
              />
            ) : (
              <div className={'flex h-full w-full items-center justify-center'}>Brak okładki</div>
            )}
            <div
              className={cn(
                'absolute h-9 rounded-xl bg-secondary px-4 py-2 text-secondary-foreground',
                'opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
              )}
            >
              Wybierz okładkę
            </div>
          </Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Wybierz okładkę</ModalTitle>
            <ModalDescription className={'sr-only'}>Okno wyboru okładki</ModalDescription>
          </ModalHeader>
          <GalleryGrid>
            {assets.map((asset) => (
              <GalleryGridItem
                key={asset.id}
                asset={asset}
                role={'button'}
                tabIndex={0}
                onClick={() => {
                  coverAssetIdControl.change(asset.id.toString());
                  setIsCoverAssetModalOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  coverAssetIdControl.change(asset.id.toString());
                  setIsCoverAssetModalOpen(false);
                }}
                className={'transition-all duration-150 hover:scale-105 active:scale-100'}
              />
            ))}
          </GalleryGrid>
        </ModalContent>
      </Modal>
    </Form>
  );
}
