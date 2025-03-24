import { defineRoutes } from '@remix-run/dev/dist/config/routes';

export const routes = defineRoutes((route) => {
  route('/', 'kiosk/splash/splash.page.tsx', { index: true });
  route('/kiosk', 'kiosk/kiosk.layout.tsx', () => {
    route('gallery', 'kiosk/gallery/gallery.page.tsx', () => {
      route(':id', 'kiosk/gallery/gallery-detail.modal.tsx');
    });
    route('timeline', 'kiosk/timeline/timeline.page.tsx');
    route('timeline/:timelineId/gallery', 'kiosk/timeline/timeline-gallery.page.tsx');
  });
  route('auth/sign-in', 'auth/sign-in.page.tsx');
  route('auth/sign-out', 'auth/sign-out.route.ts');
  route('dashboard', 'dashboard/dashboard.layout.tsx', () => {
    route('', 'dashboard/home.page.tsx', { index: true });
    route('assets/upload', 'dashboard/assets/upload.page.tsx');
    route('assets', 'dashboard/assets/list.page.tsx', () => {
      route(':id', 'dashboard/assets/edit.modal.tsx');
    });
    route('settings', 'dashboard/settings/settings.layout.tsx', () => {
      route('timeline', 'dashboard/settings/timeline/timeline.page.tsx', () => {
        route('new', 'dashboard/settings/timeline/add.page.tsx');
        route(':id', 'dashboard/settings/timeline/edit.page.tsx');
      });
      route('users', 'dashboard/settings/users/list.page.tsx', () => {
        route(':id', 'dashboard/settings/users/edit.modal.tsx');
        route('create', 'dashboard/settings/users/create.modal.tsx');
      });
    });
  });
});
