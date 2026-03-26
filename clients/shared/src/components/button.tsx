import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@kiosk-zsp4/shared/styles/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex w-fit items-center justify-center border border-transparent active:scale-[99%]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        outline: 'bg-background text-foreground border-primary',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        small: 'font-label-sm rounded-xl px-3.5 py-1.5',
        medium: 'font-label-md rounded-xl px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'small',
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    Partial<VariantProps<typeof buttonVariants>> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
