import { isRouteErrorResponse, Outlet, useRouteError } from 'react-router';
import { Button } from '@/components/base/button';
import { DashboardNav, DashboardNavItem } from '@/app/dashboard/_components/dashboard-nav';
import { Card } from '@/components/base/card';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/styles';
import { CircleExclamationIcon } from '@/components/icons';


export function meta() {
  return [{ title: 'Kiosk Izby Pamięci ZSP4 - Panel sterowania' }];
}

export interface Layout extends React.PropsWithChildren {}

export function Layout({ children }: Layout) {
  const headerRef = useRef<HTMLDivElement>(null);

  const signOut = async () => {
    await fetch('/auth/sign-out', {
      method: 'post'
    });
    location.reload();
  };

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.target.toggleAttribute('data-stuck', entry.intersectionRatio < 1);
      },
      { threshold: [1] }
    );
    observer.observe(header);

    return () => observer.unobserve(header);
  }, []);

  return (
    <div className={'flex h-full flex-col gap-2 p-2'}>
      <header
        ref={headerRef}
        className={'group container sticky -top-0.5'}
      >
        <Card
          className={cn(
            'flex items-center gap-4 bg-primary px-4 py-2 text-primary-foreground',
            'transition-all duration-100 group-data-[stuck]:rounded-t-none'
          )}
        >
          <span className={'text-xl font-bold'}>Kiosk Izby Pamięci ZSP4</span>
          <DashboardNav className={'h-fit'}>
            <DashboardNavItem to={'/dashboard/assets'}>Edycja zawartości</DashboardNavItem>
            <DashboardNavItem to={'/dashboard/settings'}>Ustawienia</DashboardNavItem>
            <DashboardNavItem
              to={'/'}
              target={'_blank'}
            >
              Podgląd kiosku
            </DashboardNavItem>
          </DashboardNav>
          <Button
            onClick={signOut}
            className={'ml-auto justify-self-end'}
          >
            Wyloguj
          </Button>
        </Card>
      </header>
      <div className={'container pb-2'}>{children}</div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <Layout>
      <main className={'flex h-full w-full items-center justify-center'}>
        <Card className={'flex flex-col justify-center'}>
          <h1 className={'inline-flex items-center gap-2 text-xl font-medium'}>
            <CircleExclamationIcon />
            <span>{isRouteErrorResponse(error) ? `Błąd ${error.status}` : 'Nieznany błąd'}</span>
          </h1>
        </Card>
      </main>
    </Layout>
  );
}

export default function DashboardLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
