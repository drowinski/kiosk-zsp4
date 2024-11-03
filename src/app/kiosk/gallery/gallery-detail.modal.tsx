import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { assetRepository } from '@/features/assets/assets.repository';

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
    <div className={'fixed bottom-0 left-0 right-0 top-0 z-50 bg-black/90'}>
      {asset &&
        (asset.assetType === 'image' ? (
          <img
            src={'/media/' + asset?.fileName}
            alt={asset.description ?? 'nieopisany materiał'}
            className={'size-full object-contain'}
          />
        ) : asset.assetType === 'video' ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={'/media/' + asset.fileName} />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={'/media/' + asset.fileName} />
        ))}
    </div>
  );
}
