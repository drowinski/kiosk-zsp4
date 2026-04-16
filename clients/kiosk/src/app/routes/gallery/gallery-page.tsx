import { useAssets } from '@kiosk-zsp4/shared/features/assets/api/get-assets';
import { useEffect, useMemo } from 'react';

import { Gallery } from '@/features/assets/components/gallery/gallery';

export function GalleryPage() {
  const { data: pagedAssets, fetchNextPage, isFetching } = useAssets();

  const assets = useMemo(
    () => pagedAssets?.pages.flatMap((page) => page.content) ?? [],
    [pagedAssets?.pages]
  );

  return (
    <main className="h-full overflow-hidden">
      <Gallery
        assets={assets}
        isFetching={isFetching}
        onRequestMoreAssets={() => void fetchNextPage()}
      />
    </main>
  );
}
