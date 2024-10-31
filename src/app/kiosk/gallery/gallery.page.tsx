import { GalleryGrid, GalleryGridItem } from '@/components/gallery-grid';
import { assetRepository } from '@/features/assets/assets.repository';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return json({ assets: assets });
}

export default function KioskGalleryPage() {
  const { assets } = useLoaderData<typeof loader>();

  return (
    <main>
      <GalleryGrid>
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
