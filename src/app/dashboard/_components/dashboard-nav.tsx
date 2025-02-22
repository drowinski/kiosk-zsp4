import { cn } from '@/utils/styles';
import { Link, useLocation } from '@remix-run/react';
import React from 'react';
import { Button } from '@/components/base/button';

export interface DashboardNavItemProps {
  route: string;
  label: string;
  newTab?: boolean;
  className?: string;
}

export function DashboardNavItem({ route, label, newTab = false, className }: DashboardNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === route;

  return (
    <Button
      asChild
      variant={isActive ? 'accent' : 'ghost'}
      className={className}
    >
      <Link to={route} target={newTab ? '_blank' : '_self'} rel={'noreferrer'}>{label}</Link>
    </Button>
  );
}

export interface DashboardSideNavProps extends React.PropsWithChildren {
  className?: string;
}

export function DashboardNav({ children, className }: DashboardSideNavProps) {
  return <nav className={cn('flex gap-1', className)}>{children}</nav>;
}
