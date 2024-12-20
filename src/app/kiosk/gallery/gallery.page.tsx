import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';
import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { useFilteredAssets } from '@/features/assets/hooks/use-filtered-assets';
import { GalleryFilters } from '@/features/assets/components/gallery-filters';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return { assets: assets };
}

export default function KioskGalleryPage() {
  const { assets } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const { filteredAssets, setFilter } = useFilteredAssets(assets);

  return (
    <main className={'flex h-full flex-col gap-1'}>
      <GalleryFilters
        setFilter={setFilter}
        className={'z-10'}
      />
      <GalleryGrid className={'no-scrollbar z-0 -mt-4 overflow-y-scroll px-1 pb-2 pt-4'}>
        {filteredAssets.map((asset) => (
          <GalleryGridItem
            key={asset.id}
            asset={asset}
            enableDebugView={true}
            onClick={() => navigate(`${asset.id}`, { preventScrollReset: true })}
          />
        ))}
      </GalleryGrid>
      <Outlet context={{ assets: filteredAssets }} />
    </main>
  );
}
