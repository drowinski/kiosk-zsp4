import React from 'react';
import { cn } from '@/utils/styles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessages?: string[] | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ errorMessages, className, ...props }, ref) => (
  <div className={'inline-flex flex-col gap-1'}>
    <input
      ref={ref}
      className={cn(
        'inline-flex h-9 items-center justify-center shadow-inner',
        'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium',
        'focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-1',
        'disabled:pointer-events-none disabled:opacity-50',
        errorMessages && 'ring-danger ring-1',
        className
      )}
      {...props}
    />
    {errorMessages &&
      new Array<string>().concat(errorMessages).map((errorMessage, index) => (
        <span
          key={index}
          className={'text-danger text-sm'}
        >
          {errorMessage}
        </span>
      ))}
  </div>
));
Input.displayName = 'Input';

export class InputMessage {}