import { cn } from '@/utils/styles';
import { AssetType } from '@/features/assets/assets.validation';
import { Video } from '@/components/video';

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
  } else {
    return <div>Niewłaściwy typ multimediów.</div>;
  }
}
