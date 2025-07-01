import React from 'react';
import { cn } from '@/utils/styles';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl bg-card p-4 text-card-foreground shadow-md', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
