import { cn } from '@/utils/styles';
import { Asset as AssetType } from '@/features/assets/assets.schemas';
import { Document } from '@/components/document.client';
import { useEffect, useState } from 'react';
import { getAssetUri } from '@/features/assets/utils/uris';
import { getAssetTypeFromMimeType } from '@/features/assets/utils/mime-types';
import { Video } from '@/components/video';

interface AssetProps {
  asset: AssetType | File;
  playbackDisabled?: boolean;
  className?: string;
}

export function Asset({ asset, playbackDisabled, className }: AssetProps) {
  const [_src, setSrc] = useState<string>('');
  const isFile = asset instanceof File;
  const src = isFile ? _src : getAssetUri(asset.fileName);
  const assetType = isFile ? getAssetTypeFromMimeType(asset.type) : asset.assetType;
  const description = isFile ? asset.name.replace(/\.[a-zA-Z0-9]+$/, '') : asset.fileName;

  useEffect(() => {
    if (!(asset instanceof File)) return;
    const objectUrl = URL.createObjectURL(asset);
    setSrc(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [asset]);

  if (assetType === 'image') {
    return (
      <img
        src={src}
        alt={description || 'Brak opisu.'}
        className={cn('max-h-full max-w-full rounded-xl', className)}
        loading={'lazy'}
      />
    );
  } else if (assetType === 'video') {
    return (
      <Video
        src={src}
        className={cn('max-h-full max-w-full', className)}
        disabled={playbackDisabled}
      />
    );
  } else if (assetType === 'audio') {
    return <audio src={src}></audio>;
  } else if (assetType === 'document') {
    return (
      <Document
        src={src}
        className={cn('rounded-xl', className)}
        fill={'contain'}
      />
    );
  } else {
    return <audio src={src} />;
  }
}
