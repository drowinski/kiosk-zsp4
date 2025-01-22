import * as React from 'react';

import { cn } from '@/utils/styles';

const TextArea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'placeholder:text-muted-foreground flex min-h-[60px] w-full',
          'rounded-xl border border-accent bg-white px-3 py-2 text-base shadow-inner',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'Textarea';

export { TextArea };
