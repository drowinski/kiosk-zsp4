import { Card } from '@/components/base/card';
import { Outlet, useLoaderData, LoaderFunctionArgs } from 'react-router';
import { SettingsNav, SettingsNavLink } from '@/app/dashboard/settings/_components/settings-nav';
import { userRepository } from '@/features/users/.server/users.repository';

export async function loader({ context: { session } }: LoaderFunctionArgs) {
  if (!session) {
    throw new Response(null, { status: 500, statusText: 'Server Error' });
  }
  const user = await userRepository.getUserById(session.user.id);
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
        {isSuperuser && <SettingsNavLink to={'users'}>Użytkownicy</SettingsNavLink>}
      </SettingsNav>
      <div className={'grow'}>
        <Outlet />
      </div>
    </Card>
  );
}
