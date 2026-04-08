import type { HTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function Header({ className, ...props }: HeaderProps) {
  return (
    <div className="px-2 pt-2">
      <header
        className={cn(
          'bg-secondary elevation-1 text-secondary-foreground flex justify-center rounded-xl px-5 py-3',
          className,
        )}
        {...props}
      >
        <span className="font-heading-md">Izba pamięci</span>
      </header>
    </div>
  );
}
