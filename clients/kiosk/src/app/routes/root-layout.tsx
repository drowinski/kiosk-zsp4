import { Outlet } from 'react-router';
import { Header } from '@/components/header';

export function RootLayout() {
  return (
    <div className="h-full flex flex-col">
      <Header>Test</Header>
      <Outlet />
    </div>
  );
}
