import React from 'react';
import { NavLink } from 'react-router';
import { Button } from '@/components/base/button';
import { cn } from '@/utils/styles';

export interface SettingsNavItemProps extends React.ComponentProps<typeof NavLink> {}

export function SettingsNavLink({ className, ...props }: SettingsNavItemProps) {
  return (
    <Button
      className={cn('[&.active]:bg-accent [&.active]:text-accent-foreground', className)}
      asChild
    >
      <NavLink {...props} />
    </Button>
  );
}

export interface SettingsNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SettingsNav({ className, children, ...props }: SettingsNavProps) {
  return (
    <nav
      className={cn('flex flex-col gap-1 border-r bg-primary p-2 text-primary-foreground', className)}
      {...props}
    >
      <h1 className={'mb-1 ml-2 text-xl font-bold'}>Ustawienia</h1>
      {children}
    </nav>
  );
}
