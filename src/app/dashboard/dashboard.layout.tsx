import { Outlet } from '@remix-run/react';
import { Button } from '@/components/base/button';
import { LoaderFunctionArgs } from '@remix-run/node';
import { requireSession } from '@/features/sessions/sessions.utils';
import { DashboardSideNav, DashboardSideNavItem } from '@/app/dashboard/_components/dashboard-side-nav';
import { Card } from '@/components/base/card';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireSession(request);
  return null;
}

export default function DashboardLayout() {
  const signOut = async () => {
    await fetch('/auth/sign-out', {
      method: 'post'
    });
    location.reload();
  };

  return (
    <div className={'flex h-full flex-col gap-2 p-2 container'}>
      <header>
        <Card className={'flex items-center bg-primary px-4 py-2 text-primary-foreground'}>
          <span className={'text-xl font-bold'}>{'Panel zarządzania'}</span>
          <Button
            onClick={signOut}
            className={'ml-auto justify-self-end'}
          >
            Wyloguj
          </Button>
        </Card>
      </header>
      <div className={'flex h-full gap-2 overflow-hidden'}>
        <div className={'flex flex-col gap-2 max-w-[20%]'}>
          <DashboardSideNav className={'h-fit'}>
            <DashboardSideNavItem
              route={'/dashboard'}
              label={'Panel zarządzania'}
            />
            <DashboardSideNavItem
              route={'/dashboard/assets'}
              label={'Zarządzaj zawartością'}
            />
            <DashboardSideNavItem
              route={'/dashboard/assets/upload'}
              label={'Dodaj zawartość'}
            />
          </DashboardSideNav>
          <div id={'dashboard-side-nav-portal'}/>
        </div>
        <div className={'h-full w-full overflow-hidden'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
