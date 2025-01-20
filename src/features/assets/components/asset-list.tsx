import { Asset } from '@/features/assets/assets.validation';
import React from 'react';
import { cn } from '@/utils/styles';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { ImageIcon, FilmIcon, TrashIcon, PencilIcon } from '@/components/icons';
import { Link } from '@remix-run/react';

interface AssetListItemProps {
  asset: Asset;
}

export function AssetListItem({ asset }: AssetListItemProps) {
  return (
    <Card className={'flex w-full gap-4 px-2 py-2 shadow-sm'}>
      <img
        src={'/media/' + asset.fileName} // TODO: Better solution (constant or function to determine path)
        alt={asset.description || 'Brak opisu.'}
        className={'aspect-square h-20 rounded-md object-cover'}
      />
      <div className={'flex w-full flex-col justify-between'}>
        <div className={'flex items-center gap-1.5 text-lg'}>
          <span className={'text-secondary'}>
            {asset.assetType === 'image' ? <ImageIcon /> : asset.assetType === 'video' ? <FilmIcon /> : 'audio'}
          </span>
          <span className={'font-medium'}>{asset.description || 'Brak opisu.'}</span>
        </div>
        <div className={'flex w-full gap-1'}>
          <Button
            variant={'secondary'}
            size={'icon'}
            className={'flex items-center gap-2 font-medium'}
            asChild
          >
            <Link to={`${asset.id}`}>
              <PencilIcon />
            </Link>
          </Button>
          <Button size={'icon'}>
            <TrashIcon />
          </Button>
        </div>
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
