import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { assetRepository } from '@/features/assets/assets.repository';
import { Card } from '@/components/base/card';
import { Asset } from '@/features/assets/components/asset';
import { formatDate } from '@/features/assets/assets.utils';

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params['id']);
  if (!id) {
    return { asset: null };
  }
  const asset = await assetRepository.getAssetById(id);
  if (!asset) {
    return { asset: null };
  }
  return {
    asset: asset
  };
}

export default function GalleryDetailModal() {
  const { asset } = useLoaderData<typeof loader>();

  return (
    <div className={'fixed bottom-0 left-0 right-0 top-0 z-50 flex gap-2 bg-black/90 p-2'}>
      <div className={'flex h-full w-full justify-center items-center'}>
        {asset && (
          <Asset
            fileName={asset.fileName}
            assetType={asset.assetType}
            description={asset.description}
          />
        )}
      </div>
      <div className={'h-full w-3/12'}>
        <Card className={'flex h-full flex-col gap-4'}>
          <span className={'text-3xl font-medium'}>O tym materiale</span>
          <span className={'text-xl'}>{asset?.description && asset.description}</span>
          <div className={'flex flex-col'}>
            <span className={'text-xl'}>
              {asset?.date
                ? asset.date.dateMin.getTime() !== asset.date.dateMax.getTime() && !asset.date.dateIsRange
                  ? 'Przybliżona data'
                  : 'Data'
                : 'Data'}
            </span>
            <span className={'text-2xl font-medium'}>{asset?.date ? formatDate(asset.date) : 'Nieznana'}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
