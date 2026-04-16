import { useEffect, useRef, useState } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';
import type { Asset } from '@kiosk-zsp4/shared/types/api';
import { GalleryItemSkeleton } from '@/features/assets/components/gallery/gallery-item-skeleton';
import { GalleryItem } from '@/features/assets/components/gallery/gallery-item';
import { joinUrl } from '@kiosk-zsp4/shared/utils/join-url';
import { env } from '@/config/env';
import { GalleryDetailOverlay } from '@/features/assets/components/gallery/gallery-detail-overlay';

export interface GalleryProps {
  assets?: Asset[];
  isFetching?: boolean;
  onRequestMoreAssets?: () => unknown;
}

export function Gallery({
  assets = [],
  isFetching = false,
  onRequestMoreAssets,
}: GalleryProps) {
  const isLoading = assets?.length === 0 && isFetching;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fetchNextPageSentinelRef = useRef<HTMLDivElement>(null);

  const [detailAssetId, setDetailAssetId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = fetchNextPageSentinelRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isFetching && entries[0].isIntersecting) {
          onRequestMoreAssets?.();
        }
      },
      { root: container, threshold: 0, rootMargin: '0px 0px 200% 0px' }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onRequestMoreAssets, assets.length, isFetching]);

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'no-scrollbar gallery-scroll-container h-full overflow-y-scroll px-4.5',
        isLoading && 'overflow-y-hidden'
      )}
    >
      <div className="grid grid-cols-5 gap-1 py-2">
        {isLoading &&
          Array.from({ length: 100 }, (_, index) => (
            <GalleryItemSkeleton key={index} />
          ))}
        {assets.map((asset) => (
          <GalleryItem
            key={asset.id}
            thumbnailUri={joinUrl(env.BASE_URL, asset.mediaUri)}
            description={asset.description ?? undefined}
            onClick={() => {
              setDetailAssetId(asset.id);
              setIsDetailOpen(true);
            }}
          />
        ))}
        <div
          ref={fetchNextPageSentinelRef}
          className="col-span-5 h-0"
        />
      </div>
      <GalleryDetailOverlay
        assets={assets}
        initialAssetId={detailAssetId ?? undefined}
        isOpen={isDetailOpen}
        onOpenChange={(isOpen) => setIsDetailOpen(isOpen)}
        onRequestMoreAssets={() => !isFetching && onRequestMoreAssets?.()}
      />
    </div>
  );
}
