import { GalleryGrid, GalleryGridItem } from '@/components/gallery-grid';
import { assetRepository } from '@/features/assets/assets.repository';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Asset } from '@/features/assets/assets.validation';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  const repeatedAssets: Asset[] = new Array(10).fill(assets).flat();
  return json({ assets: repeatedAssets });
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
