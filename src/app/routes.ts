import { defineRoutes } from '@remix-run/dev/dist/config/routes';

export const routes = defineRoutes((route) => {
  route('/', 'home/home.page.tsx', { index: true });
  route('auth/sign-up', 'auth/sign-up/sign-up.page.tsx');
  route('auth/sign-in', 'auth/sign-in/sign-in.page.tsx');
  route('auth/sign-out', 'auth/sign-out/sign-out.route.ts');
  route('assets/upload', 'assets/upload/upload.page.tsx');
  route('dashboard', 'dashboard/dashboard.layout.tsx', () => {
    route('', 'dashboard/home/home.page.tsx', { index: true });
  });
});
