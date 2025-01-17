import { Asset } from '@/features/assets/assets.validation';
import React from 'react';
import { cn } from '@/utils/styles';
import { Card } from '@/components/base/card';

interface AssetListItemProps {
  asset: Asset;
}

export function AssetListItem({ asset }: AssetListItemProps) {
  return (
    <Card className={'flex w-full gap-4 px-2 py-2 shadow-sm'}>
      <img
        src={'/media/' + asset.fileName}
        alt={asset.description || 'Brak opisu.'}
        className={'aspect-square h-24 object-cover rounded-md'}
      />
      <div className={'flex flex-col'}>
        <span className={'font-bold text-lg'}>{asset.description}</span>
        <span>{asset.assetType}</span>
      </div>
    </Card>
  );
}

interface AssetListProps extends React.HTMLProps<HTMLDivElement> {}

export function AssetList({ children, className, ...props }: AssetListProps) {
  return (
    <div
      className={cn('flex w-full flex-col gap-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}
