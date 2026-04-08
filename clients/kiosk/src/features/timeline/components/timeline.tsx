import { type HTMLAttributes, useEffect, useRef } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';
import {
  TimelineItem,
  type TimelineItemData,
} from '@/features/timeline/components/timeline-item';

export interface TimelineProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  items: TimelineItemData[];
}

export function Timeline({ className, items, ...props }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;
    if (!container || items.length === 0) return;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.previousElementSibling?.setAttribute(
            'data-left',
            'true',
          );
          entry.target.setAttribute('data-center', 'true');
          entry.target.nextElementSibling?.setAttribute('data-right', 'true');
        } else {
          entry.target.previousElementSibling?.removeAttribute('data-left');
          entry.target.nextElementSibling?.removeAttribute('data-right');
          entry.target.removeAttribute('data-center');
        }
      });
    };

    const observer = new IntersectionObserver(onIntersect, {
      root: container,
      rootMargin: '-40%',
      threshold: 0.1,
    });

    items.forEach((item) => observer.observe(item));

    return () => items.forEach((item) => observer.unobserve(item));
  }, []);

  return (
    <nav
      aria-label="Oś czasu — wybór okresu"
      ref={containerRef}
      className={cn('w-full', className)}
      {...props}
    >
      <ul
        className={
          'no-scrollbar flex h-full w-full snap-x snap-mandatory items-center justify-start overflow-auto'
        }
      >
        {items.map((item, index) => (
          <TimelineItem
            ref={(element) => {
              if (element === null) return;
              itemsRef.current[index] = element;
            }}
            key={index}
            item={item}
          />
        ))}
      </ul>
    </nav>
  );
}
