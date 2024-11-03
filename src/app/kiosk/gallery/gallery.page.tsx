import { GalleryGrid, GalleryGridItem } from '@/components/gallery/gallery-grid';
import { assetRepository } from '@/features/assets/assets.repository';
import { useLoaderData } from '@remix-run/react';
import { useFilteredAssets } from '@/features/assets/hooks/use-filtered-assets';
import { GalleryFilters } from '@/components/gallery/gallery-filters';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return { assets: assets };
}

export default function KioskGalleryPage() {
  const { assets } = useLoaderData<typeof loader>();

  const { filteredAssets, setFilter } = useFilteredAssets(assets);

  return (
    <main className={'flex h-full flex-col gap-2'}>
      <GalleryFilters setFilter={setFilter} />
      <GalleryGrid className={'h-full overflow-hidden'}>
        {filteredAssets.map((asset) => (
          <GalleryGridItem
            key={asset.id}
            asset={asset}
            enableDebugView={true}
          />
        ))}
      </GalleryGrid>
    </main>
  );
}
