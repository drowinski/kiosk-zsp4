import React from 'react';
import { cn } from '@/utils/styles';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDownIcon } from '@/components/icons';
import { ClientOnly } from 'remix-utils/client-only';

export function Select({ onValueChange, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Root>) {
  const handleValueChange = (value: string) => {
    if (!onValueChange) return;
    if (value === 'none') {
      onValueChange('');
    } else {
      onValueChange(value);
    }
  };

  return (
    <RadixSelect.Root
      onValueChange={handleValueChange}
      {...props}
    />
  );
}

export const SelectOption = React.forwardRef<
  React.ElementRef<typeof RadixSelect.SelectItem>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.SelectItem>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.SelectItem
    ref={ref}
    className={cn(
      'h-9 items-center justify-center bg-white px-3 py-2',
      'cursor-pointer select-none whitespace-nowrap text-sm font-medium text-black',
      'focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:outline-none',
      className
    )}
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.SelectItem>
));
SelectOption.displayName = 'SelectOption';

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      'inline-flex h-9 w-fit items-center justify-center gap-1 border border-accent shadow-inner',
      'whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-medium text-black',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadixSelect.Value placeholder={placeholder} />
    <RadixSelect.Icon>
      <ChevronDownIcon />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <ClientOnly>
    {() => (
      <RadixSelect.Portal>
        <RadixSelect.Content
          ref={ref}
          className={cn('z-50', className)}
          {...props}
        >
          <RadixSelect.Viewport className={'rounded-xl border border-accent shadow-inner'}>
            {children}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    )}
  </ClientOnly>
));
SelectContent.displayName = 'SelectContent';
