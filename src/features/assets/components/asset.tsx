import { Card } from '@/components/base/card';
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
  const assetComponent = (() => {
    if (assetType === 'image') {
      return (
        <img
          src={fullUri}
          alt={description || 'Brak opisu.'}
          className={'size-full object-contain'}
        />
      );
    } else if (assetType === 'video') {
      return (
        <video
          src={fullUri}
          className={'size-full object-contain'}
        />
      );
    } else if (assetType === 'audio') {
      return <audio src={fullUri}></audio>;
    } else {
      return <div>Niewłaściwy typ multimediów.</div>;
    }
  })();

  return <Card className={cn('overflow-hidden p-0', className)}>{assetComponent}</Card>;
}
