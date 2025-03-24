import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';
import { LoaderFunctionArgs } from '@remix-run/node';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Navigation, Pagination, Zoom } from 'swiper/modules';
import { Asset as AssetComponent } from '@/features/assets/components/asset';
import { Card } from '@/components/base/card';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, XIcon } from '@/components/icons';
import { formatDate } from '@/features/assets/utils/dates';
import { Button } from '@/components/base/button';
import { Asset } from '@/features/assets/assets.validation';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/utils/styles';

import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/mousewheel';
import { Tag } from '@/features/tags/tags.validation';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const timelineRangeId = parseInt(params.timelineId || '');
  if (!timelineRangeId) {
    throw new Response(null, { status: 400, statusText: 'Bad Request' });
  }

  const searchParams = new URLSearchParams(new URL(request.url).searchParams);
  console.log(searchParams.entries());
  let tagId: number | undefined = parseInt(searchParams.get('tag') || '');
  console.log(tagId);
  tagId = Number.isNaN(tagId) ? undefined : tagId;

  const assets = await timelineRepository.getAssetsByTimelineRangeId(timelineRangeId, tagId);
  const allAssetTags = Array.from(
    assets
      .reduce<Map<Tag['id'], Tag>>((map, asset) => {
        asset.tags.forEach((tag) => map.set(tag.id, tag));
        return map;
      }, new Map())
      .values()
  ).sort((a, b) => (a.name > b.name ? 1 : -1));
  return { assets, allAssetTags };
}

export default function TimelineGalleryPage() {
  const { assets, allAssetTags } = useLoaderData<typeof loader>();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAssetIndex, setDetailAssetIndex] = useState(0);
  const location = useLocation();
  const tagId = new URLSearchParams(location.search).get('tag');

  const openDetailModal = (assetIndex?: number) => {
    if (assetIndex) setDetailAssetIndex(assetIndex);
    setIsDetailModalOpen(true);
  };

  return (
    <main className={'flex h-full flex-col gap-1'}>
      <Card className={'bg-primary p-0 text-primary-foreground'}>
        <nav className={'flex gap-1 p-1'}>
          <Button
            className={cn('grow', !tagId && 'bg-accent text-accent-foreground')}
            asChild
          >
            <Link
              to={{ search: '' }}
              replace
            >
              Wszystkie
            </Link>
          </Button>
          {allAssetTags.map((tag) => (
            <Button
              key={tag.id}
              className={cn('grow', tagId === tag.id.toString() && 'bg-accent text-accent-foreground')}
              asChild
            >
              <Link
                to={{ search: `?tag=${tag.id}` }}
                replace
              >
                {tag.name}
              </Link>
            </Button>
          ))}
        </nav>
      </Card>
      <GalleryGrid className={'no-scrollbar z-0 -mt-4 overflow-y-scroll px-1 pb-2 pt-4'}>
        {assets.map((asset, index) => (
          <GalleryGridItem
            key={asset.id}
            asset={asset}
            enableDebugView={true}
            tabIndex={0}
            role={'button'}
            onClick={() => openDetailModal(index)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDetailModal(index)}
          />
        ))}
      </GalleryGrid>
      <GalleryDetailModal
        open={isDetailModalOpen}
        onOpenChange={(open) => setIsDetailModalOpen(open)}
        assets={assets}
        currentAssetIndex={detailAssetIndex}
      />
    </main>
  );
}

export interface GalleryDetailModalProps {
  assets: Asset[];
  currentAssetIndex: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GalleryDetailModal({ assets, currentAssetIndex, open, onOpenChange }: GalleryDetailModalProps) {
  const [asset, setAsset] = useState<Asset>(assets[currentAssetIndex]);
  const [isOpen, _setIsOpen] = useState(open);

  if (open !== isOpen) {
    _setIsOpen(open);
  }

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogOverlay className={cn('absolute inset-0 bg-black', 'data-[state=open]:animate-gallery-detail-fade-in')} />
      <DialogContent
        className={cn('absolute inset-0 flex h-full w-full', 'data-[state=open]:animate-gallery-detail-scale-in')}
      >
        <div className={'max-w-4/5 flex w-4/5 items-center justify-center overflow-hidden'}>
          <Swiper
            modules={[Navigation, Pagination, Mousewheel, Zoom]}
            spaceBetween={50}
            slidesPerView={1}
            initialSlide={currentAssetIndex}
            navigation={{ prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' }}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
              thresholdDelta: 10,
              thresholdTime: 500
            }}
            zoom={{ minRatio: 1, maxRatio: 3, toggle: true }}
            onSlideChange={(swiper) => setAsset(assets[swiper.activeIndex])}
            className={'h-full w-full rounded-xl'}
          >
            {assets.map((asset, index) => (
              <SwiperSlide key={index}>
                <div
                  className={cn(
                    'flex h-full w-full items-center justify-center p-4',
                    asset.assetType === 'image' && 'swiper-zoom-container'
                  )}
                >
                  <AssetComponent
                    assetType={asset.assetType}
                    fileName={asset.fileName}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className={'h-full w-1/5 p-2 pl-0'}>
          <Card className={'flex h-full flex-col gap-4'}>
            <DialogTitle className={'inline-flex items-center gap-2 text-3xl'}>
              <InfoIcon /> O tym materiale
            </DialogTitle>
            <DialogDescription className={'text-xl'}>{asset?.description && asset.description}</DialogDescription>
            <div className={'flex flex-col'}>
              <span className={'text-xl'}>
                {asset?.date
                  ? asset.date.dateMin.getTime() !== asset.date.dateMax.getTime() && !asset.date.dateIsRange
                    ? 'Przybliżona data'
                    : 'Data'
                  : 'Data'}
              </span>
              <span className={'text-2xl font-medium'}>{asset?.date ? formatDate(asset.date) : 'Nieznana'}</span>
            </div>
            <div className={'mt-auto flex gap-2'}>
              <Button className={'swiper-button-prev grow gap-1'}>
                <ChevronLeftIcon />
                Poprzedni
              </Button>
              <Button className={'swiper-button-next grow gap-1'}>
                Następny
                <ChevronRightIcon />
              </Button>
            </div>
          </Card>
        </div>
        <Button
          size={'icon'}
          variant={'ghost'}
          className={'absolute left-3 top-3 z-10'}
          onClick={() => setIsOpen(false)}
          aria-label={'Zamknij'}
        >
          <XIcon color={'white'} />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
