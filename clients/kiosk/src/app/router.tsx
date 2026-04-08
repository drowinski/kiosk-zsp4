import { createBrowserRouter, RouterProvider } from 'react-router';
import { TimelinePage } from '@/app/routes/timeline/timeline-page';
import { RootLayout } from '@/app/routes/root-layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <TimelinePage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
