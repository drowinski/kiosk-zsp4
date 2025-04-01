import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/styles';

export const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium',
    'transition-[background-color,filter] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
    'disabled:pointer-events-none disabled:opacity-50'
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm',
        accent: 'bg-accent text-accent-foreground shadow-sm0',
        success: 'bg-green-600 text-white shadow-sm',
        danger: 'bg-red-600 text-white shadow-sm',
        ghost: 'hover:bg-white/25'
      },
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'size-fit p-3 leading-none',
        square: 'w-fit aspect-square p-3'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={'button'}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
