import { createBrowserRouter, RouterProvider } from 'react-router';
import { DashboardPage } from '@/app/routes/dashboard/dashboard-page';
import { OtherPage } from '@/app/routes/dashboard/other-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/other',
    element: <OtherPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
