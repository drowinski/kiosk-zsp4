import { Card } from '@/components/base/card';
import { Outlet, useNavigate, useRouteError } from '@remix-run/react';
import { ArrowLeftIcon, CircleExclamationIcon } from '@/components/icons';
import { Button } from '@/components/base/button';
import React from 'react';

export interface Layout extends React.PropsWithChildren {}

export function Layout({ children }: Layout) {
  const navigate = useNavigate();

  return (
    <div className={'flex h-full select-none flex-col'}>
      <header className={'p-1'}>
        <Card className={'flex items-center justify-between bg-primary px-2 py-2 text-primary-foreground'}>
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => navigate('..')}
          >
            <ArrowLeftIcon />
          </Button>
          <span className={'text-xl font-bold'}>Izba Pamięci</span>
          <div className={'grow-1 basis-0'} />
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
      <div className={'flex h-full w-full items-center justify-center'}>
        <Card>
          <span className={'inline-flex items-center gap-2 text-xl font-medium'}>
            <CircleExclamationIcon /> Wystąpił błąd
          </span>
        </Card>
      </div>
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
