import type { HTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex flex-col rounded-xl p-5',
        className,
      )}
      {...props}
    />
  );
}
