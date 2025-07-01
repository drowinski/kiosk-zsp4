import { index, layout, prefix, route, RouteConfig } from '@react-router/dev/routes';

export default [
  index('kiosk/splash/splash.page.tsx'),
  layout('kiosk/kiosk.layout.tsx', [
    route('gallery', 'kiosk/gallery/gallery.page.tsx', [route(':id', 'kiosk/gallery/gallery-detail.modal.tsx')]),
    route('timeline', 'kiosk/timeline/timeline.page.tsx'),
    route('timeline/:timelineId', 'kiosk/timeline/timeline-gallery.page.tsx')
  ]),
  ...prefix('auth', [route('sign-in', 'auth/sign-in.page.tsx'), route('sign-out', 'auth/sign-out.route.ts')]),
  ...prefix('dashboard', [
    layout('dashboard/dashboard.layout.tsx', [
      index('dashboard/home.route.ts'),
      route('assets', 'dashboard/assets/list.page.tsx', [
        route('upload', 'dashboard/assets/upload.modal.tsx'),
        route(':id', 'dashboard/assets/edit.modal.tsx'),
        route('edit', 'dashboard/assets/edit-many.modal.tsx')
      ]),
      route('settings', 'dashboard/settings/settings.layout.tsx', [
        index('dashboard/settings/index.route.ts'),
        route('timeline', 'dashboard/settings/timeline/timeline.page.tsx', [
          index('dashboard/settings/timeline/index.route.ts'),
          route('new', 'dashboard/settings/timeline/add.page.tsx'),
          route(':id', 'dashboard/settings/timeline/edit.page.tsx')
        ]),
        route('users', 'dashboard/settings/users/list.page.tsx', [
          route(':id', 'dashboard/settings/users/edit.modal.tsx'),
          route('create', 'dashboard/settings/users/add.modal.tsx')
        ]),
        route('tags', 'dashboard/settings/tags/list.page.tsx', [
          route(':id', 'dashboard/settings/tags/edit.modal.tsx'),
          route('create', 'dashboard/settings/tags/add.modal.tsx')
        ])
      ])
    ])
  ])
] satisfies RouteConfig;
