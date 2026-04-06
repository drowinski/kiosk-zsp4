import type { HTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface FormErrorProps extends HTMLAttributes<HTMLSpanElement> {}

export function FormError({ className, children, ...props }: FormErrorProps) {
  return children ? (
    <span
      className={cn('text-danger w-56 max-w-full text-wrap', className)}
      {...props}
    >
      {children}
    </span>
  ) : null;
}
