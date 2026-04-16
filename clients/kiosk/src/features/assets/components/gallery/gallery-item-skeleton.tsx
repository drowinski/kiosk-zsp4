import { Card } from '@kiosk-zsp4/shared/components/card';

export function GalleryItemSkeleton() {
  return (
    <Card
      className={'aspect-square animate-pulse p-0 [animation-duration:800ms]'}
    />
  );
}
