import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './globals.css';
import React, { useEffect } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';

export function Layout({ children }: { children: React.ReactNode }) {
  // Prevent default pinch to zoom
  useEffect(() => {
    const listener = (event: WheelEvent) => {
      const { ctrlKey } = event;
      if (ctrlKey) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('wheel', listener, { passive: false });

    return () => window.removeEventListener('wheel', listener);
  }, []);

  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className={'bg-background text-foreground'}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  );
}
