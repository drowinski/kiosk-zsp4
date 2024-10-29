import { Card } from '@/components/base/card';
import { cn } from '@/utils/styles';
import { Link, useLocation } from '@remix-run/react';
import React from 'react';
import { Button } from '@/components/base/button';

export interface DashboardSideNavItemProps {
  route: string;
  label: string;
  className?: string;
}

export function DashboardSideNavItem({ route, label, className }: DashboardSideNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === route;

  return (
    <Button
      asChild
      variant={isActive ? 'default' : 'ghost'}
      className={cn('justify-start', className)}
    >
      <Link to={route}>{label}</Link>
    </Button>
  );
}

export interface DashboardSideNavProps extends React.PropsWithChildren {
  className?: string;
}

export function DashboardSideNav({ children, className }: DashboardSideNavProps) {
  return (
    <Card className={cn('flex flex-col gap-2', className)}>
      <span className={'text-xl text-primary'}>Nawigacja</span>
      <nav className={'flex flex-col gap-1'}>
        {children}
      </nav>
    </Card>
  );
}
