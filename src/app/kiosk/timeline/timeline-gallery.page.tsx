import type { Route } from './+types/timeline-gallery.page';
import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';
import { Link, useLocation } from 'react-router';
import { timelineRepository } from '@/features/timeline/.server/timeline.repository';
import { Swiper, SwiperSlide, useSwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Mousewheel, Navigation, Pagination, Zoom } from 'swiper/modules';
import { Asset as AssetComponent } from '@/features/assets/components/asset';
import { Card } from '@/components/base/card';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, XIcon } from '@/components/icons';
import { formatDate } from '@/features/assets/utils/dates';
import { Button } from '@/components/base/button';
import { Asset } from '@/features/assets/assets.schemas';
import { tagSchema } from '@/features/tags/tags.schemas';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/utils/styles';
import { timelineRangeSchema } from '@/features/timeline/timeline.schemas';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';

import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/mousewheel';

export async function loader({ request, params, context: { logger } }: Route.LoaderArgs) {
  logger.info('Parsing params...');
  const [timelineRangeId, timelineRangeIdOk, timelineRangeIdError] = await tryAsync(
    timelineRangeSchema.shape.id.parseAsync(params.timelineId)
  );
  if (!timelineRangeIdOk) {
    logger.error(timelineRangeIdError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  const [tagId, tagIdOk, tagIdError] = await tryAsync(
    tagSchema.shape.id.optional().parseAsync(new URL(request.url).searchParams.get('tag') || undefined)
  );
  if (!tagIdOk) {
    logger.error(tagIdError);
    throw status(StatusCodes.BAD_REQUEST);
  }

  logger.info('Getting assets associated with timeline range...');
  const [assets, assetsOk, assetsError] = await tryAsync(
    timelineRepository.getAssetsByTimelineRangeId(timelineRangeId, tagId)
  );
  if (!assetsOk) {
    logger.error(assetsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Getting available tags...');
  const [tags, tagsOk, tagsError] = await tryAsync(timelineRepository.getUniqueTagsByTimelineRangeId(timelineRangeId));
  if (!tagsOk) {
    logger.error(tagsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Success.');
  return { assets, tags };
}

export default function TimelineGalleryPage({ loaderData: { assets, tags } }: Route.ComponentProps) {
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
      <Card className={'z-10 bg-primary p-0 text-primary-foreground'}>
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
          {tags.map((tag) => (
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
            // enableDebugView={true}
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
  const [asset, setAsset] = useState<Asset | undefined>(assets[currentAssetIndex]);
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
      <DialogOverlay
        className={cn('absolute inset-0 bg-black', 'z-20 data-[state=open]:animate-gallery-detail-fade-in')}
      />
      <DialogContent
        className={cn('absolute inset-0 flex h-full w-full', 'z-20 data-[state=open]:animate-gallery-detail-scale-in')}
      >
        <div className={'max-w-4/5 flex w-4/5 items-center justify-center overflow-hidden'}>
          <Swiper
            // tabIndex={0}
            modules={[Navigation, Pagination, Mousewheel, Zoom, Keyboard, A11y]}
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
            keyboard={{
              onlyInViewport: false
            }}
            a11y={{
              containerMessage: 'slajdy z multimediami',
              firstSlideMessage: 'to jest pierwszy slajd',
              lastSlideMessage: 'to jest ostatni slajd',
              nextSlideMessage: 'następny slajd',
              prevSlideMessage: 'poprzedni slajd'
            }}
            className={'h-full w-full rounded-xl'}
          >
            {assets.map((asset) => (
              <SwiperSlide key={asset.id}>
                <Slide asset={asset} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className={'h-full w-1/5 p-2 pl-0'}>
          <Card className={'flex h-full flex-col gap-4'}>
            <DialogTitle
              className={'inline-flex items-center gap-2 text-3xl'}
              asChild
            >
              <h1>
                <InfoIcon /> O tym materiale
              </h1>
            </DialogTitle>
            <DialogDescription className={'text-2xl'}>{asset?.description && asset.description}</DialogDescription>
            {asset && asset.tags.length > 0 && (
              <div
                role={'list'}
                className={'flex flex-wrap gap-1'}
              >
                {asset.tags.map((tag) => (
                  <div
                    key={tag.id}
                    role={'listitem'}
                    className={cn(
                      'flex w-fit items-center justify-center text-nowrap rounded-xl text-lg',
                      'bg-secondary px-2 py-1 text-secondary-foreground'
                    )}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
            <div className={'flex flex-col'}>
              <h2 className={'text-xl'}>
                {asset?.date
                  ? asset.date.dateMin.getTime() !== asset.date.dateMax.getTime() && !asset.date.dateIsRange
                    ? 'Przybliżona data'
                    : 'Data'
                  : 'Data'}
              </h2>
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
        ;
      </DialogContent>
    </Dialog>
  );
}

interface SlideProps {
  asset: Asset;
}

export function Slide({ asset }: SlideProps) {
  const slide = useSwiperSlide();

  return (
    <SwiperSlide>
      <div
        className={cn(
          'flex h-full w-full items-center justify-center p-4',
          asset.assetType === 'image' && 'swiper-zoom-container'
        )}
      >
        <AssetComponent
          fileName={asset.fileName}
          assetType={asset.assetType}
          description={asset.description}
          playbackDisabled={!slide.isActive}
        />
      </div>
    </SwiperSlide>
  );
}
