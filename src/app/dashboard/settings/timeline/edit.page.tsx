import { formatCaption } from '@/features/timeline/utils/strings';
import { Form, useLoaderData } from '@remix-run/react';
import { Input } from '@/components/base/input';
import { getYYYYMMDD } from '@/utils/dates';
import { TimelineRange, updateTimelineRangeSchema } from '@/features/timeline/timeline.validation';
import { LoaderFunctionArgs } from '@remix-run/node';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { useForm, useInputControl } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Asset as AssetComponent } from '@/features/assets/components/asset';
import { Asset } from '@/features/assets/assets.validation';
import { Button } from '@/components/base/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';

const updateTimelineRangeForm = updateTimelineRangeSchema;

export async function loader({ params }: LoaderFunctionArgs) {
  const timelineRangeId = parseInt(params.id || '');
  console.log(timelineRangeId);
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

export default function TimelineRangeEditPage() {
  const { timelineRange, assets } = useLoaderData<typeof loader>();

  return (
    <div className={'flex flex-col gap-1'}>
      <h3 className={'text-xl font-bold'}>{formatCaption(timelineRange)}</h3>
      <TimelineRangeEditForm
        key={timelineRange.id}
        timelineRange={timelineRange}
        assets={assets}
      />
    </div>
  );
}

interface TimelineRangeEditFormProps {
  timelineRange: TimelineRange;
  assets: Asset[];
}

export function TimelineRangeEditForm({ timelineRange, assets }: TimelineRangeEditFormProps) {
  const [form, fields] = useForm({
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
      className={'flex gap-1'}
    >
      <div className={'flex flex-col gap-1'}>
        <Input
          type={'number'}
          value={fields.id.value}
          readOnly
        />
        <Input
          type={'date'}
          name={fields.minDate.name}
          defaultValue={fields.minDate.initialValue}
        />
        <Input
          type={'date'}
          name={fields.maxDate.name}
          defaultValue={fields.maxDate.initialValue}
        />
        <Input
          placeholder={'Opis'}
          name={fields.caption.name}
          defaultValue={fields.caption.initialValue}
        />
        <Input
          name={fields.coverAssetId.name}
          value={coverAssetIdControl.value}
          readOnly
        />
        <Modal>
          <ModalTrigger asChild>
            <Button>Wybierz okładkę</Button>
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
      </div>
      {coverAsset && (
        <div className={'grow'}>
          <AssetComponent
            assetType={coverAsset.assetType}
            fileName={coverAsset.fileName}
            className={'max-h-full max-w-full'}
          />
        </div>
      )}
    </Form>
  );
}
