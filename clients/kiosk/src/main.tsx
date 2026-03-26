import { createBrowserRouter, RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';
import '@kiosk-zsp4/shared/styles/globals.css';
import '@/styles/globals.css';
import { Button } from '@kiosk-zsp4/shared/components/button';
import { Card } from '@kiosk-zsp4/shared/components/card';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className="flex h-full items-center justify-center">
        <Card>
          <h1 className="font-heading-lg">Digital<br/>Kiosk</h1>
          <h2 className="font-heading-md">Digital<br/>Kiosk</h2>
          <h3 className="font-heading-sm">Digital<br/>Kiosk</h3>
          <p className="w-[50ch]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
            fermentum mi in justo congue, vel ullamcorper neque bibendum.
            Integer quis tortor consequat diam maximus lacinia sit amet a est.
            Fusce vel nulla consectetur dolor semper malesuada. Proin
            condimentum magna laoreet, pulvinar est ut, vulputate mi. Cras
            sollicitudin ullamcorper augue id.
          </p>
          <div className="flex gap-1">
            <Button variant="primary">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant="primary"
              size="medium"
            >
              Button
            </Button>
            <Button
              variant="outline"
              size="medium"
            >
              Button
            </Button>
          </div>
        </Card>
      </div>
    ),
  },
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);
