import { Asset } from '@/features/assets/assets.validation';
import React from 'react';
import { cn } from '@/utils/styles';
import { Card } from '@/components/base/card';
import { ImageIcon, FilmIcon } from '@/components/icons';
import { formatDate } from '@/features/assets/utils/dates';
import { Checkbox } from '@/components/base/checkbox';
import { Link } from '@remix-run/react';
import { RemixLinkProps } from '@remix-run/react/dist/components';
import { getAssetThumbnailUri } from '@/features/assets/utils/uris';

interface AssetListItemProps {
  asset: Asset;
  linkTo: RemixLinkProps['to'];
  linkState?: RemixLinkProps['state'];
  isSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

export function AssetListItem({ asset, linkTo, linkState, isSelected = false, onSelectedChange }: AssetListItemProps) {
  const accessibilityDescription =
    (asset.assetType === 'image' ? 'zdjęcie: ' : asset.assetType === 'video' ? 'film: ' : '') +
    (asset.description ?? 'Nieopisany zasób');

  return (
    <Card className={'flex w-full items-center gap-3 px-2 py-0 shadow-sm'}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelectedChange?.(checked === true)}
        aria-label={`Zaznacz ${accessibilityDescription}`}
      />
      <Link
        to={linkTo}
        state={linkState}
        aria-label={`Edytuj ${accessibilityDescription}`}
        className={'flex w-full gap-3 py-2'}
      >
        <img
          src={getAssetThumbnailUri(asset.fileName)}
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
          <span className={'-mt-1'}>{asset.date ? formatDate(asset.date) : 'Brak daty'}</span>
        </div>
      </Link>
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
