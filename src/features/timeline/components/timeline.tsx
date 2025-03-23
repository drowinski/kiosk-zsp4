import { cn } from '@/utils/styles';
import React, { Fragment, useEffect, useRef } from 'react';
import { useNavigate } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';

export interface TimelineItemProps extends React.ComponentPropsWithRef<'div'> {
  coverUri: string;
  itemTitle?: string;
  lineStart?: boolean;
  onClickUri?: string;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ coverUri, itemTitle, lineStart, onClickUri, className, ...props }, ref) => {
    const navigate = useNavigate();

    const FragmentOrDiv = lineStart ? 'div' : Fragment;

    return (
      <div
        ref={ref}
        className={cn('group flex flex-col items-center gap-4', className)}
        {...props}
      >
        <div
          className={cn(
            'relative flex aspect-[3/4] w-1/2 items-center justify-center overflow-hidden',
            'rounded-xl border-8 border-primary bg-primary shadow-md',
            'duration-500 ease-in-out group-[[data-selected=true]]:delay-75',
            'group-[[data-selected=true]]:-translate-y-8 group-[[data-selected=true]]:scale-110',
            'group-[[data-selected=true]]:shadow-xl'
          )}
          role={'link'}
          tabIndex={0}
          onClick={() => onClickUri && navigate(onClickUri)}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onClickUri && navigate(onClickUri)}
          aria-label={itemTitle}
        >
          <img
            src={coverUri}
            alt={'okładka'}
            className={'h-full w-full scale-125 object-cover'}
          />
        </div>
        <div
          className={cn(
            'flex flex-col items-center',
            'duration-500 group-[[data-selected=true]]:delay-200',
            'group-[[data-selected=true]]:-translate-y-1 group-[[data-selected=true]]:scale-105',
            'group-[[data-selected=true]]:drop-shadow-xl'
          )}
        >
          <span className={'text-3xl font-bold'}>{itemTitle}</span>
        </div>
        <FragmentOrDiv>
          <div
            className={cn(
              'flex h-10 min-h-10 w-10 min-w-10 items-center overflow-visible rounded-xl bg-primary shadow-md',
              'duration-500 group-[[data-selected=true]]:delay-300 peer-hover:scale-110 peer-hover:shadow-lg',
              'group-[[data-selected=true]]:scale-110 group-[[data-selected=true]]:shadow-xl'
            )}
          />
          {lineStart && (
            <div className={'absolute left-0 -z-10 h-3 w-full -translate-y-[26px] bg-secondary shadow-md'} />
          )}
        </FragmentOrDiv>
      </div>
    );
  }
);
TimelineItem.displayName = 'TimelineItem';

export interface TimelineProps {
  className?: string;
  children?: React.ReactElement<TimelineItemProps> | React.ReactElement<TimelineItemProps>[];
}

function _Timeline({ children, className, ...props }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Map<number, HTMLDivElement> | null>(null);

  function getItemsMap() {
    if (!itemsRef.current) {
      itemsRef.current = new Map();
    }
    return itemsRef.current;
  }

  const itemsMapSize = getItemsMap().size;

  // useLayoutEffect(() => {
  //   sessionStorage.clear(); // TODO: Hacky solution for clearing scroll state of gallery, fix
  // }, []);

  const childrenWithRef = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        key: index,
        ref: (node: HTMLDivElement) => {
          const itemsMap = getItemsMap();
          if (node) {
            itemsMap.set(index, node);
          } else {
            itemsMap.delete(index);
          }
        },
        lineStart: index === 0
      });
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;
    if (!container || !items || items.size === 0) return;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-selected', 'true');
        } else {
          entry.target.removeAttribute('data-selected');
        }
      });
    };

    const observer = new IntersectionObserver(onIntersect, {
      root: container,
      rootMargin: '-30%',
      threshold: 0.5
    });

    items.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      items.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, [itemsMapSize, containerRef]);

  return (
    <div
      ref={containerRef}
      className={cn('no-scrollbar flex snap-x snap-mandatory items-center justify-center overflow-x-scroll', className)}
      {...props}
    >
      <div className={'flex w-1/3 flex-row items-center overflow-visible'}>
        {childrenWithRef}
        <div className={'h-1 min-w-full'} />
      </div>
    </div>
  );
}

export const Timeline = (props: TimelineProps) => <ClientOnly>{() => <_Timeline {...props} />}</ClientOnly>;
