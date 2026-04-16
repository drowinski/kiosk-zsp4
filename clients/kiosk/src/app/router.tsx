import { createBrowserRouter, RouterProvider } from 'react-router';
import { TimelinePage } from '@/app/routes/timeline/timeline-page';
import { RootLayout } from '@/app/routes/root-layout';
import { GalleryPage } from '@/app/routes/gallery/gallery-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <TimelinePage />,
      },
      {
        path: '/gallery',
        element: <GalleryPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
