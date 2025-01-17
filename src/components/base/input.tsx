import React from 'react';
import { cn } from '@/utils/styles';

export const InputMessage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => {
  return (
    <span
      ref={ref}
      className={'text-sm text-danger'}
      {...props}
    />
  );
});
InputMessage.displayName = 'InputError';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessages?: string[] | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ errorMessages, className, ...props }, ref) => (
  <>
    <input
      ref={ref}
      className={cn(
        'inline-flex h-9 items-center justify-center shadow-inner',
        'whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-medium text-black',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        'file:border-0 file:bg-transparent',
        errorMessages && 'ring-1 ring-danger',
        className
      )}
      {...props}
    />
    {errorMessages && // TODO: Remove this part
      new Array<string>().concat(errorMessages).map((errorMessage, index) => (
        <span
          key={index}
          className={'text-sm text-danger'}
        >
          {errorMessage}
        </span>
      ))}
  </>
));
Input.displayName = 'Input';
