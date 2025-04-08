import { cn } from '@/utils/styles';
import { AssetType } from '@/features/assets/assets.schemas';
import { Video } from '@/components/video';
import { Document } from '@/components/document.client';

interface AssetProps {
  assetType: AssetType;
  fullUrl?: string;
  fileName?: string;
  description?: string | null;
  className?: string;
}

export function Asset({ assetType, fullUrl, fileName, description, className }: AssetProps) {
  if (!fileName && !fullUrl) {
    return null;
  }

  const fullUri = fullUrl || '/media/' + fileName;

  if (assetType === 'image') {
    return (
      <img
        src={fullUri}
        alt={description || 'Brak opisu.'}
        className={cn('max-h-full max-w-full rounded-xl', className)}
        loading={'lazy'}
      />
    );
  } else if (assetType === 'video') {
    return (
      <Video
        src={fullUri}
        className={cn('max-h-full max-w-full', className)}
      />
    );
  } else if (assetType === 'audio') {
    return <audio src={fullUri}></audio>;
  } else if (assetType === 'document') {
    return (
      <Document
        src={fullUri}
        className={cn('rounded-xl', className)}
        fill={'contain'}
      />
    );
  } else {
    return <audio src={fullUri} />;
  }
}
