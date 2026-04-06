import type { InputHTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'bg-background text-foreground border-primary font-label-md placeholder:text-muted focus:border-focus w-56 rounded-xl border px-3 py-1.5 focus:ring-0',
        className,
      )}
      {...props}
    />
  );
}
