import type { TimelineItemData } from '@/features/timeline/components/timeline-item';
import { Timeline } from '@/features/timeline/components/timeline';

const testItems: TimelineItemData[] = [
  {
    coverUri:
      'https://images.pexels.com/photos/8985189/pexels-photo-8985189.jpeg',
    caption: '1918–1939',
  },
  {
    coverUri:
      'https://images.pexels.com/photos/6853287/pexels-photo-6853287.jpeg',
    caption: '1945–1959',
  },
  {
    coverUri:
      'https://images.pexels.com/photos/4790613/pexels-photo-4790613.jpeg',
    caption: '1960–1979',
  },
  {
    coverUri:
      'https://images.pexels.com/photos/5472514/pexels-photo-5472514.jpeg',
    caption: '1980–1999',
  },
  {
    coverUri:
      'https://images.pexels.com/photos/1472999/pexels-photo-1472999.jpeg',
    caption: '2000–dziś',
  },
].map((item) => ({ ...item, onClickUri: '#' }));

export function TimelinePage() {
  return (
    <main className="flex h-full items-center justify-center overflow-hidden">
      <Timeline
        className="h-4/5"
        items={testItems}
      />
    </main>
  );
}
