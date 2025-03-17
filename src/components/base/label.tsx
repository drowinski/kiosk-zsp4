import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/styles';

const labelVariants = cva(
  'inline-flex text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        vertical: 'flex-col gap-1 w-fit items-start',
        horizontal: 'flex-row gap-2 items-center w-fit'
      }
    },
    defaultVariants: {
      variant: 'vertical'
    }
  }
);

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant: variant }), className)}
    {...props}
  />
));
Label.displayName = 'Label';
