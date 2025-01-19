import { Asset } from '@/features/assets/assets.validation';
import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/styles';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { ImageIcon, FilmIcon, TrashIcon, CheckIcon, CalendarIcon } from '@/components/icons';
import { SeamlessInput } from '@/components/base/seamless-input';
import { formatDate } from '@/features/assets/assets.utils';

interface AssetListItemProps {
  asset: Asset;
  onChange?: (assetChanges: Partial<Asset>) => void;
  onCommitChanges?: (assetChanges: Partial<Asset>) => void;
}

export function AssetListItem({ asset, onChange, onCommitChanges }: AssetListItemProps) {
  const [isModified, setIsModified] = useState(false);
  const [assetChanges, setAssetChanges] = useState<Partial<Asset>>({});

  useEffect(() => {
    if (Object.keys(assetChanges).length === 0) {
      setIsModified(false);
    } else {
      setIsModified(true);
    }
    if (onChange) {
      onChange(assetChanges);
    }
  }, [assetChanges, onChange]);

  const handleEdit = <K extends keyof Asset>(key: K, value: Asset[K]) => {
    if (asset[key] === value) {
      setAssetChanges((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: matchingWithOriginal, ...edited } = prev;
        return edited;
      });
      return;
    }
    setAssetChanges((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className={'flex w-full gap-4 px-2 py-2 shadow-sm'}>
      <img
        src={'/media/' + asset.fileName}
        alt={asset.description || 'Brak opisu.'}
        className={'aspect-square h-20 rounded-md object-cover'}
      />
      <div className={'flex w-full flex-col justify-between'}>
        <div className={'flex items-center gap-2'}>
          <span className={'text-secondary'}>
            {asset.assetType === 'image' ? <ImageIcon /> : asset.assetType === 'video' ? <FilmIcon /> : 'audio'}
          </span>
          <SeamlessInput
            className={'text-lg font-medium'}
            defaultValue={asset.description || undefined}
            onChange={(event) => handleEdit('description', event.currentTarget.value)}
          />
        </div>
        <div className={'flex w-full gap-1'}>
          {isModified && (
            <Button
              size={'icon'}
              className={'flex gap-2 bg-green-600'}
              disabled={!isModified}
              onClick={() => onCommitChanges && onCommitChanges(assetChanges)}
            >
              <CheckIcon /> Zatwierdź zmiany
            </Button>
          )}
          <Button
            variant={'secondary'}
            size={'icon'}
            className={'flex items-center gap-2 font-medium'}
          >
            <CalendarIcon /> {asset?.date ? formatDate(asset.date) : 'Brak daty'}
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
