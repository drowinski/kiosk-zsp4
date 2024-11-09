import { cn } from '@/utils/styles';
import { AssetType } from '@/features/assets/assets.validation';

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
      />
    );
  } else if (assetType === 'video') {
    return (
      <video
        src={fullUri}
        className={cn('max-h-full max-w-full rounded-xl', className)}
      />
    );
  } else if (assetType === 'audio') {
    return <audio src={fullUri}></audio>;
  } else {
    return <div>Niewłaściwy typ multimediów.</div>;
  }
}
