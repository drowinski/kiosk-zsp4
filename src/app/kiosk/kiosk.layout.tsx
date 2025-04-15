import { Card } from '@/components/base/card';
import { Outlet, useLocation, useNavigate, useRouteError } from 'react-router';
import { ArrowLeftIcon, CircleExclamationIcon } from '@/components/icons';
import { Button } from '@/components/base/button';
import React from 'react';
import { useIdleTimer } from 'react-idle-timer';

export function meta() {
  return [{ title: 'Kiosk Izby Pamięci ZSP4' }];
}

export interface Layout extends React.PropsWithChildren {}

export function Layout({ children }: Layout) {
  const location = useLocation();
  const navigate = useNavigate();

  const onIdle = () => {
    if (location.pathname === '/') return;
    navigate('/');
  };

  useIdleTimer({
    onIdle,
    timeout: CLIENT_ENV.IDLE_TIMER_SECONDS * 1000,
    throttle: 500
  });

  return (
    <div className={'flex h-full select-none flex-col'}>
      <header className={'p-1'}>
        <Card className={'flex items-center justify-between bg-primary px-2 py-2 text-primary-foreground'}>
          <div className={'grow basis-0'}>
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => navigate(-1)}
              aria-label={'Cofnij'}
              className={'basis-0'}
            >
              <ArrowLeftIcon />
            </Button>
          </div>
          <span className={'text-xl font-bold'}>Izba Pamięci</span>
          <div className={'grow basis-0'} />
        </Card>
      </header>
      <div className={'h-full overflow-hidden px-1'}>{children}</div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <Layout>
      <main className={'flex h-full w-full items-center justify-center'}>
        <Card>
          <span className={'inline-flex items-center gap-2 text-xl font-medium'}>
            <CircleExclamationIcon /> Wystąpił błąd
          </span>
        </Card>
      </main>
    </Layout>
  );
}

export default function KioskLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
