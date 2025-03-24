import { Card } from '@/components/base/card';
import { Outlet } from '@remix-run/react';
import { SettingsNav, SettingsNavLink } from '@/app/dashboard/settings/_components/settings-nav';


export default function SettingsLayout() {
  return (
    <Card className={'flex overflow-hidden p-0'}>
      <SettingsNav className={'w-1/5 min-w-[20%]'}>
        <SettingsNavLink to={'tags'}>Tagi</SettingsNavLink>
        <SettingsNavLink
          to={'timeline'}
          className={'px-4 py-2'}
        >
          Oś czasu
        </SettingsNavLink>
        <SettingsNavLink to={'splash'}>Slajdy tytułowe</SettingsNavLink>
        <SettingsNavLink to={'users'}>Użytkownicy</SettingsNavLink>
      </SettingsNav>
      <div className={'grow'}>
        <Outlet />
      </div>
    </Card>
  );
}
