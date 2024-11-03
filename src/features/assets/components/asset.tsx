import { cn } from '@/utils/styles';
import { AssetType } from '@/features/assets/assets.validation';

interface AssetProps {
  fileName: string;
  assetType: AssetType;
  description?: string | null;
  className?: string;
}

export function Asset({ fileName, assetType, description, className }: AssetProps) {
  const fullUri = '/media/' + fileName;

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
