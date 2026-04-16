import { type ComponentProps, useState } from 'react';
import { Card } from '@kiosk-zsp4/shared/components/card';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface GalleryItemProps extends Omit<
  ComponentProps<typeof Card>,
  'children'
> {
  thumbnailUri: string;
  description?: string;
}

export function GalleryItem({
  thumbnailUri,
  description,
  className,
  ...props
}: GalleryItemProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);

  if (isImageError) return null;

  return (
    <Card
      className={cn(
        'aspect-square p-0',
        isImageLoading && 'animate-pulse [animation-duration:800ms]',
        className
      )}
      {...props}
    >
      <img
        src={thumbnailUri}
        alt={description ?? 'brak opisu'}
        onLoad={() => setIsImageLoading(false)}
        onError={() => {
          setIsImageError(true);
          setIsImageLoading(false);
        }}
        className={cn('h-full w-full object-cover', isImageError && 'hidden')}
      />
    </Card>
  );
}
