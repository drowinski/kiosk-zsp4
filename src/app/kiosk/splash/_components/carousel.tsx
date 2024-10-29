'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/styles';
import { Slot } from '@radix-ui/react-slot';

export interface CarouselItemProps extends React.PropsWithChildren {}

export function CarouselItem({ ...props }: CarouselItemProps) {
  return (
    <Slot
      className={cn('size-full object-cover')}
      {...props}
    />
  );
}

export interface CarouselProps {
  intervalMs: number;
  className?: string;
  children?: React.ReactElement<CarouselItemProps> | React.ReactElement<CarouselItemProps>[];
}

export function Carousel({ intervalMs, className, children }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!Array.isArray(children)) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [children, currentIndex, intervalMs]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className={'hidden'}></div>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'absolute size-full transition-opacity duration-500',
                currentIndex === index ? 'opacity-100' : 'opacity-0'
              )}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
