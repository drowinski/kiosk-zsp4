import { GalleryGrid, GalleryGridItem } from '@/components/gallery-grid';
import { assetRepository } from '@/features/assets/assets.repository';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { FilterControls } from '@/app/kiosk/gallery/_components/filter-controls';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return json({ assets: assets });
}

export default function KioskGalleryPage() {
  const { assets } = useLoaderData<typeof loader>();

  return (
    <main className={'flex flex-col gap-2 h-full'}>
      <FilterControls
        className={'sticky top-0 left-0'}
      />
      <GalleryGrid className={'h-full overflow-hidden'}>
        {assets.map((asset) => (
          <GalleryGridItem
            key={asset.id}
            asset={asset}
          />
        ))}
      </GalleryGrid>
    </main>
  );
}
