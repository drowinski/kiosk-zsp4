import React from 'react';
import { cn } from '@/utils/styles';

interface OptionProps extends React.InputHTMLAttributes<HTMLOptionElement> {}

export const Option = React.forwardRef<HTMLOptionElement, OptionProps>(({ className, ...props }, ref) => (
  <option
    ref={ref}
    className={className}
    {...props}
  />
));
Option.displayName = 'Option';

interface SelectProps extends React.InputHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'inline-flex h-9 appearance-none items-center justify-center border border-accent shadow-inner',
      'whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-medium text-black',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Select.displayName = 'Select';
