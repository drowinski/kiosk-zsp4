import { Card } from '@/components/base/card';
import { Outlet } from '@remix-run/react';

export default function KioskLayout() {
  return (
    <div>
      <header className={'sticky left-0 top-0 z-50 mx-1 pt-1 mb-2 bg-background rounded-b-xl'}>
        <Card className={'flex items-center justify-center bg-primary px-4 py-3 text-primary-foreground'}>
          <span className={'text-xl font-bold'}>Izba Pamięci</span>
        </Card>
      </header>
      <div className={'h-full px-1'}>
        <Outlet />
      </div>
    </div>
  );
}
