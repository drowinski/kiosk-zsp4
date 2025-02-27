import { Asset } from '@/features/assets/assets.validation';
import React from 'react';
import { cn } from '@/utils/styles';
import { Card } from '@/components/base/card';
import { ImageIcon, FilmIcon } from '@/components/icons';
import { Link } from '@remix-run/react';
import { formatDate } from '@/features/assets/assets.utils';

interface AssetListItemProps {
  asset: Asset;
}

export function AssetListItem({ asset }: AssetListItemProps) {
  return (
    <Link
      to={`${asset.id}`}
      preventScrollReset
    >
      <Card className={'flex w-full gap-3 px-2 py-2 shadow-sm'}>
        <img
          src={'/media/thumbnails/' + asset.fileName.split('.')[0] + '.jpeg'} // TODO: Better solution (constant or function to determine path)
          alt={asset.description || 'Brak opisu.'}
          className={'aspect-square h-16 rounded-md object-cover'}
        />
        <div className={'flex w-full min-w-0 flex-col'}>
          <div className={'flex min-w-0 items-center gap-1.5 text-lg'}>
            <span className={'text-secondary'}>
              {asset.assetType === 'image' ? <ImageIcon /> : asset.assetType === 'video' ? <FilmIcon /> : 'audio'}
            </span>
            <span className={'w-full min-w-0 overflow-hidden text-ellipsis text-nowrap font-medium'}>
              {asset.description || 'Brak opisu.'}
            </span>
          </div>
          <span>{asset.date ? formatDate(asset.date) : 'Brak daty'}</span>
        </div>
      </Card>
    </Link>
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
