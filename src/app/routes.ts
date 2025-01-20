import { defineRoutes } from '@remix-run/dev/dist/config/routes';

export const routes = defineRoutes((route) => {
  route('/', 'kiosk/splash/splash.page.tsx', { index: true });
  route('/kiosk', 'kiosk/kiosk.layout.tsx', () => {
    route('gallery', 'kiosk/gallery/gallery.page.tsx', () => {
      route(':id', 'kiosk/gallery/gallery-detail.modal.tsx');
    });
  });
  route('auth/sign-up', 'auth/sign-up.page.tsx');
  route('auth/sign-in', 'auth/sign-in.page.tsx');
  route('auth/sign-out', 'auth/sign-out.route.ts');
  route('dashboard', 'dashboard/dashboard.layout.tsx', () => {
    route('', 'dashboard/home.page.tsx', { index: true });
    route('assets/upload', 'dashboard/assets/upload.page.tsx');
    route('assets', 'dashboard/assets/list.page.tsx', () => {
      route(':id', 'dashboard/assets/edit.modal.tsx');
    });
  });
});
