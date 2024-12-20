import { useNavigate, useOutletContext, useParams } from '@remix-run/react';
import { Card } from '@/components/base/card';
import { Asset as AssetComponent } from '@/features/assets/components/asset';
import { type Asset } from '@/features/assets/assets.validation';
import { formatDate } from '@/features/assets/assets.utils';
import { Button } from '@/components/base/button';

// export async function loader({ params }: LoaderFunctionArgs) {
//   const id = Number(params['id']);
//   if (!id) {
//     return { asset: null };
//   }
//   const asset = await assetRepository.getAssetById(id);
//   if (!asset) {
//     return { asset: null };
//   }
//   return {
//     asset: asset
//   };
// }

export default function GalleryDetailModal() {
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params['id']);

  const { assets } = useOutletContext<{ assets: Asset[] }>();

  const assetIndex = assets.findIndex((asset) => asset.id === id);
  const asset = assets[assetIndex];

  return (
    <div className={'fixed bottom-0 left-0 right-0 top-0 z-50 flex gap-2 bg-black/90 p-2'}>
      <div className={'flex h-full w-full items-center justify-center'}>
        {asset && (
          <AssetComponent
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
          <div className={'mt-auto flex gap-2'}>
            <Button
              type={'button'}
              className={'grow'}
              onClick={() => navigate('../' + assets[assetIndex - 1].id, { preventScrollReset: true, replace: true })}
            >
              Poprzedni
            </Button>
            <Button
              type={'button'}
              className={'grow'}
              onClick={() => navigate('../' + assets[assetIndex + 1].id, { preventScrollReset: true, replace: true })}
            >
              Następny
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
