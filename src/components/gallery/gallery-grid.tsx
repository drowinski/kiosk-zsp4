import { cn } from '@/utils/styles';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Asset } from '@/features/assets/assets.validation';

export interface GalleryGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  asset: Asset;
  enableDebugView?: boolean;
}

export function GalleryGridItem({ asset, enableDebugView = false, className, ...props }: GalleryGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const image = useMemo(
    () => (
      <img
        ref={imageRef}
        alt={asset.description ?? 'Missing description.'}
        className={'size-full object-cover'}
        draggable={false}
        loading={'lazy'}
      />
    ),
    [asset.description]
  );

  useEffect(() => {
    if (!imageRef.current) {
      return;
    }

    const onLoad = () => {
      setIsLoading(false);
    };
    imageRef.current.addEventListener('load', onLoad);

    const onError = () => {
      setIsLoading(false);
      setIsError(true);
    };
    imageRef.current.addEventListener('error', onError);

    imageRef.current.src = '/media/' + asset.fileName; // TODO: Better solution

    const imageRefCurrent = imageRef.current;

    return () => {
      imageRefCurrent.removeEventListener('load', onLoad);
      imageRefCurrent.removeEventListener('error', onError);
    };
  }, [image, asset.fileName]);

  return (
    <div
      className={cn('relative aspect-square overflow-clip rounded-xl bg-primary/20 shadow-sm', className)}
      {...props}
    >
      <div className={cn('absolute size-full', (isLoading || isError) && 'invisible')}>{image}</div>
      {isLoading && <div className={'absolute flex size-full flex-col items-center justify-center'}>Ładowanie...</div>}
      {isError && (
        <div className={'absolute flex size-full flex-col items-center justify-center opacity-50'}>
          <span className={'text-xl font-bold'}>Błąd</span>
        </div>
      )}
      {enableDebugView && (
        <div className={'absolute flex size-full flex-col'}>
          <span>ID: {asset.id}</span>
          <span>File name: {asset.fileName}</span>
          <span>Asset type: {asset.assetType}</span>
          <span>Date min: {asset.date?.dateMin.toString()}</span>
          <span>Date max: {asset.date?.dateMax.toString()}</span>
          <span>Date precision: {asset.date?.datePrecision}</span>
        </div>
      )}
    </div>
  );
}

export interface GalleryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columnCount?: number;
}

export const GalleryGrid = React.forwardRef<HTMLDivElement, GalleryGridProps>(
  ({ columnCount = 5, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid gap-1', className)}
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GalleryGrid.displayName = 'GalleryGrid';
