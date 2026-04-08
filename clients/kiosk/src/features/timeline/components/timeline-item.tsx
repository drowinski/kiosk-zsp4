import { Link } from 'react-router';
import { Card } from '@kiosk-zsp4/shared/components/card';
import type { Ref } from 'react';

export interface TimelineItemData {
  coverUri: string;
  caption: string;
  onClickUri: string;
}

export interface TimelineItemProps {
  ref?: Ref<HTMLLIElement>;
  item: TimelineItemData;
}

export function TimelineItem({
  ref,
  item: { coverUri, caption, onClickUri },
}: TimelineItemProps) {
  return (
    <li
      ref={ref}
      className="group relative flex h-full min-w-1/3 snap-start flex-col items-center px-2 py-0.5 [&:last-child_.timeline-line]:hidden"
    >
      <Card className="elevation-1 aspect-8/11 min-h-0 max-w-full flex-1 translate-y-1/40 scale-95 p-0 transition-all duration-300 ease-in-out group-data-center:translate-y-0 group-data-center:scale-100 group-data-center:delay-500 group-data-left:-rotate-1 group-data-left:delay-500 group-data-right:rotate-1 group-data-right:delay-500">
        <Link
          to={onClickUri}
          className="group h-full w-full"
        >
          <img
            src={coverUri}
            alt=""
            className="group-focus-visible:border-primary h-full w-full rounded-xl object-cover group-focus-visible:border-3"
          />
          <span className="sr-only">Okres "{caption}"</span>
        </Link>
      </Card>
      <span
        aria-hidden
        className={'font-heading-lg mt-5 mb-4'}
      >
        {caption}
      </span>
      <div className="bg-primary elevation-1 flex size-10 shrink-0 justify-center rounded-xl">
        <div className="timeline-line bg-secondary absolute -z-10 h-2 w-full translate-x-1/2 translate-y-4 opacity-90" />
        <div className="bg-secondary absolute -z-10 h-2 w-full translate-y-4 opacity-10" />
      </div>
    </li>
  );
}
