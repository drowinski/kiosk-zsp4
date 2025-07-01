import { cn } from '@/utils/styles';
import { AssetType } from '@/features/assets/assets.schemas';
import { Document } from '@/components/document.client';
import { getAssetUri } from '@/features/assets/utils/uris';
import { Video } from '@/components/video';

interface AssetProps {
  fileName: string;
  assetType: AssetType;
  description?: string | null;
  playbackDisabled?: boolean;
  className?: string;
}

export function Asset({ fileName, assetType, description, playbackDisabled, className }: AssetProps) {
  const src = getAssetUri(fileName);

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
        controls
      />
    );
  } else {
    return <audio src={src} />;
  }
}
