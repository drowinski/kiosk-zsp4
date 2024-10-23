import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'Kiosk ZSP4' }];
};

export default function Index() {
  return (
    <main className="flex h-full items-center justify-center">
      <span className={'text-6xl font-extrabold'}>Kiosk ZSP4</span>
    </main>
  );
}
