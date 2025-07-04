import React from 'react';
import { cn } from '@/utils/styles';

export const InputDescription = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => (
    <span
      ref={ref}
      className={'text-sm text-muted'}
      hidden={!children}
      {...props}
    >
      {children}
    </span>
  )
);
InputDescription.displayName = 'InputDescription';

export const InputErrorMessage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => (
    <span
      ref={ref}
      className={'text-sm text-danger'}
      hidden={!children}
      {...props}
    >
      {children}
    </span>
  )
);
InputErrorMessage.displayName = 'InputErrorMessage';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessages?: string[] | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ errorMessages, className, hidden, ...props }, ref) => (
    <>
      <input
        ref={ref}
        className={cn(
          'inline-flex h-9 items-center justify-center border border-accent shadow-inner',
          'whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-medium text-black',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          'disabled:pointer-events-none disabled:opacity-50',
          'file:border-0 file:bg-transparent',
          hidden && 'hidden',
          errorMessages && 'ring-1 ring-danger',
          className
        )}
        hidden={hidden}
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
  )
);
Input.displayName = 'Input';
