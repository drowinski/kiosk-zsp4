import React from 'react';
import { cn } from '@/utils/styles';
import { Input } from '@/components/base/input';

interface RadioGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {}

export const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn('group flex justify-stretch gap-1', className)}
    {...props}
  />
));
RadioGroup.displayName = 'RadioGroup';

interface RadioInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const RadioInput = React.forwardRef<HTMLInputElement, RadioInputProps>(
  ({ children, className, ...props }, ref) => (
    <label
      className={cn(
        'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium',
        'border border-primary bg-accent text-accent-foreground shadow-sm hover:brightness-110',
        'has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground',
        'disabled:pointer-events-none disabled:opacity-50 group-disabled:pointer-events-none group-disabled:opacity-50',
        className
      )}
    >
      <Input
        ref={ref}
        type={'radio'}
        className={'hidden'}
        {...props}
      />
      {children}
    </label>
  )
);
RadioInput.displayName = 'RadioInput';
