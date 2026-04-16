import type { Asset } from '@kiosk-zsp4/shared/types/api';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Zoom } from 'swiper/modules';
import { joinUrl } from '@kiosk-zsp4/shared/utils/join-url';
import { env } from '@/config/env';

// @ts-expect-error likely caused by noUncheckedSideEffectImports: true
import 'swiper/css';
// @ts-expect-error ditto
import 'swiper/css/zoom';

export interface GalleryDetailOverlayProps {
  assets: Asset[];
  initialAssetId?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => unknown;
  onRequestMoreAssets?: () => unknown;
}

export function GalleryDetailOverlay({
  assets,
  initialAssetId,
  isOpen: isOpenProp,
  onOpenChange,
  onRequestMoreAssets,
}: GalleryDetailOverlayProps) {
  const [isOpenInternal, setIsOpenInternal] = useState(isOpenProp ?? false);

  const isOpen = isOpenProp ?? isOpenInternal; // TODO: Make accessible

  const setIsOpen = (isOpen: boolean) => {
    if (isOpenProp === undefined) {
      setIsOpenInternal(isOpen);
    }
    onOpenChange?.(isOpen);
  };

  const [currentAssetIndex, setCurrentAssetIndex] = useState(
    Math.max(
      0,
      assets.findIndex((asset) => asset.id === initialAssetId)
    )
  );

  return (
    isOpen && (
      <div className="absolute top-0 left-0 z-100 flex h-full w-full animate-[gallery-detail-overlay-scale-up_0.1s_ease-out] flex-col overflow-clip bg-black text-neutral-100">
        <button
          className="absolute z-100 rounded-full px-4 py-3"
          onClick={() => setIsOpen(false)}
        >
          X
        </button>
        <Swiper
          initialSlide={Math.max(
            0,
            assets.findIndex((asset) => asset.id === initialAssetId)
          )}
          onSwiper={(swiper) => setCurrentAssetIndex(swiper.activeIndex)}
          onSlideChange={(swiper) => {
            setCurrentAssetIndex(swiper.activeIndex);
            if (swiper.activeIndex + 1 === swiper.slides.length) {
              onRequestMoreAssets?.();
            }
          }}
          onZoomChange={(swiper, scale) => {
            swiper.allowSlidePrev = scale < 1.1;
            swiper.allowSlideNext = scale < 1.1;
          }}
          zoom={true}
          keyboard={{
            enabled: true,
            speed: 0,
          }}
          modules={[Zoom, Keyboard]}
          className="w-full grow"
        >
          {assets.map((asset) => (
            <SwiperSlide
              key={asset.id}
              className="px-4 py-0 pt-4 pb-(--caption-height)"
            >
              <div className="swiper-zoom-container">
                <img
                  src={joinUrl(env.BASE_URL, asset.mediaUri)}
                  alt={asset.description ?? 'brak opisu'}
                  className="rounded-xl"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div
          ref={(element) => {
            if (!element) return;

            const resizeObserver = new ResizeObserver((entries) => {
              const height = entries[0].borderBoxSize[0].blockSize;
              document.documentElement.style.setProperty(
                '--caption-height',
                `${height}px`
              );
            });

            resizeObserver.observe(element);
          }}
          className={
            'font-label-md pointer-events-none absolute bottom-0 z-100 flex w-full justify-center gap-2 bg-linear-to-b from-transparent to-black/60 px-4 py-5'
          }
        >
          <div>Kategoria</div>
          <div className="flex grow justify-center">
            {assets[currentAssetIndex].description}
          </div>
          <div>
            {assets[currentAssetIndex].date?.min.toString() ?? 'brak daty'}
          </div>
        </div>
      </div>
    )
  );
}
