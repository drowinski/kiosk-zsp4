import { cn } from '@/utils/styles';
import { NavLink } from '@remix-run/react';
import React from 'react';
import { Button } from '@/components/base/button';

export interface DashboardNavItemProps extends React.ComponentProps<typeof NavLink> {}

export function DashboardNavItem({ className, ...props }: DashboardNavItemProps) {
  return (
    <Button
      asChild
      variant={'ghost'}
      className={cn('[&.active]:bg-accent [&.active]:text-accent-foreground', className)}
    >
      <NavLink
        {...props}
        rel={'noreferrer'}
        reloadDocument // TODO: better fix for better search param and filter component sync
      />
    </Button>
  );
}

export interface DashboardSideNavProps extends React.PropsWithChildren {
  className?: string;
}

export function DashboardNav({ children, className }: DashboardSideNavProps) {
  return (
    <nav
      aria-label={'Główna'}
      className={cn('flex gap-1', className)}
    >
      {children}
    </nav>
  );
}
