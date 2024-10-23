import { defineRoutes } from '@remix-run/dev/dist/config/routes';

export const routes = defineRoutes((route) => {
  route('/', 'home/home.page.tsx', { index: true });
  route('auth/sign-up', 'auth/sign-up/sign-up.page.tsx');
  route('auth/sign-in', 'auth/sign-in/sign-in.page.tsx');
});
