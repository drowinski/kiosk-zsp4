import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function Card({ ref, className, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl p-5',
        className
      )}
      {...props}
    />
  );
}
