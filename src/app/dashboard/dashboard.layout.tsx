import { Outlet } from '@remix-run/react';
import { Button } from '@/components/base/button';
import { LoaderFunctionArgs } from '@remix-run/node';
import { requireSession } from '@/features/sessions/sessions.utils';

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
    <div className={'flex h-full flex-col'}>
      <header className={'bg-primary text-primary-foreground flex items-center px-4 py-2'}>
        <span className={'text-xl font-bold'}>Izba Pamięci - Wirtualne Archiwum</span>
        <Button
          onClick={signOut}
          className={'ml-auto justify-self-end'}
        >
          Wyloguj
        </Button>
      </header>
      <main className={'h-full'}>
        <Outlet />
      </main>
    </div>
  );
}
