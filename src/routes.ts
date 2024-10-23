import { defineRoutes } from '@remix-run/dev/dist/config/routes';

export const routes = defineRoutes((route) => {
  route('/', 'home/home.index.tsx', { index: true });
});
