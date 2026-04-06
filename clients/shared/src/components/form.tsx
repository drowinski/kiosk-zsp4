import type { FormHTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {}

export function Form({ className, ...props }: FormProps) {
  return (
    <form
      className={cn('flex flex-col gap-3 items-end', className)}
      {...props}
    />
  );
}
