import { Outlet } from '@remix-run/react';
import { Button } from '@/components/base/button';
import { LoaderFunctionArgs } from '@remix-run/node';
import { requireSession } from '@/features/sessions/sessions.utils';
import { DashboardNav, DashboardNavItem } from '@/app/dashboard/_components/dashboard-nav';
import { Card } from '@/components/base/card';
import { useEffect, useRef } from 'react';
import { cn } from '@/utils/styles';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireSession(request);
  return null;
}

export function meta() {
  return [
    { title: 'Kiosk Izby Pamięci ZSP4 - Panel sterowania'}
  ];
}

export default function DashboardLayout() {
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
            <DashboardNavItem
              route={'/dashboard/assets'}
              label={'Zawartość'}
            />
            <DashboardNavItem
              route={'/dashboard/users'}
              label={'Użytkownicy'}
            />
            <DashboardNavItem
              route={'/kiosk/gallery'}
              label={'Podgląd kiosku'}
              newTab
            />
          </DashboardNav>
          <Button
            onClick={signOut}
            className={'ml-auto justify-self-end'}
          >
            Wyloguj
          </Button>
        </Card>
      </header>
      <div className={'container pb-2'}>
        <Outlet />
      </div>
    </div>
  );
}
