import { createBrowserRouter, RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';
import { GREETING } from '@/greeting.ts';
import { SHARED_PACKAGE_TEST } from '@kiosk-zsp4/shared';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>{GREETING + " " + SHARED_PACKAGE_TEST}</div>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);
