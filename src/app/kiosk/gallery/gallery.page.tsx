import { GalleryGrid, GalleryGridItem } from '@/features/assets/components/gallery-grid';
import { assetRepository, AssetSorting } from '@/features/assets/assets.repository';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { GalleryFilters } from '@/features/assets/components/gallery-filters';
import { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const minYear = parseInt(url.searchParams.get('minYear') ?? '') || undefined;
  const maxYear = parseInt(url.searchParams.get('maxYear') ?? '') || undefined;
  const sort = url.searchParams.get('sort');

  const assets = await assetRepository.getAssets({
    filters: {
      ...(minYear && { dateMin: new Date(minYear, 0, 1) }),
      ...(maxYear && { dateMax: new Date(maxYear + 1, 0, 1) })
    },
    sorting: {
      property: (sort?.split('_').at(0) as AssetSorting['property'] | null) || 'date',
      direction: (sort?.split('_').at(1) as AssetSorting['direction'] | null) || 'asc'
    }
  });
  return { assets: assets };
}

export default function KioskGalleryPage() {
  const { assets } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <main className={'flex h-full flex-col gap-1'}>
      <GalleryFilters className={'z-10'} />
      <GalleryGrid className={'no-scrollbar z-0 -mt-4 overflow-y-scroll px-1 pb-2 pt-4'}>
        {assets.map((asset) => (
          <GalleryGridItem
            key={asset.id}
            asset={asset}
            enableDebugView={true}
            onClick={() => navigate(`${asset.id}`, { preventScrollReset: true })}
          />
        ))}
      </GalleryGrid>
      <Outlet context={{ assets: assets }} />
    </main>
  );
}
