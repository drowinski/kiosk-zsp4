import { Card } from '@/components/base/card';
import { Outlet } from '@remix-run/react';

export default function KioskLayout() {
  return (
    <div className={'h-full flex flex-col select-none'}>
      <header className={'p-1'}>
        <Card className={'flex items-center justify-center bg-primary px-4 py-3 text-primary-foreground'}>
          <span className={'text-xl font-bold'}>Izba Pamięci</span>
        </Card>
      </header>
      <div className={'h-full px-1 overflow-hidden'}>
        <Outlet />
      </div>
    </div>
  );
}
