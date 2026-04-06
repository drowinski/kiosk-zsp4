import type { FieldsetHTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface FormGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {}

export function FormGroup({ className, ...props }: FormGroupProps) {
  return <fieldset className={cn("flex flex-col gap-2", className)} {...props} />;
}
