import { Card } from '@/components/base/card';
import { Outlet, useLoaderData, LoaderFunctionArgs } from 'react-router';
import { SettingsNav, SettingsNavLink } from '@/app/dashboard/settings/_components/settings-nav';
import { getSession } from '@/features/sessions/sessions.server-utils';
import { userRepository } from '@/features/users/users.repository';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session.data.userId) {
    throw new Response(null, { status: 500, statusText: 'Server Error' });
  }
  const user = await userRepository.getUserById(session.data.userId);
  if (!user) {
    throw new Response(null, { status: 500, statusText: 'Server Error' });
  }
  return { isSuperuser: user.isSuperuser };
}

export default function SettingsLayout() {
  const { isSuperuser } = useLoaderData<typeof loader>();

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
        {isSuperuser && <SettingsNavLink to={'users'}>Użytkownicy</SettingsNavLink>}
      </SettingsNav>
      <div className={'grow'}>
        <Outlet />
      </div>
    </Card>
  );
}
