import { Card } from '@/components/base/card';
import { Outlet, useNavigate } from '@remix-run/react';
import { ArrowLeftIcon } from '@/components/icons';
import { Button } from '@/components/base/button';

export default function KioskLayout() {
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
      <div className={'h-full overflow-hidden px-1'}>
        <Outlet />
      </div>
    </div>
  );
}
