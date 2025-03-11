import { userRepository } from '@/features/users/users.repository';
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/base/table';
import { Button } from '@/components/base/button';
import { CheckIcon, EditIcon, XIcon } from '@/components/icons';
import { LoaderFunctionArgs } from '@remix-run/node';
import { getSession } from '@/features/sessions/sessions.server-utils';
import { requireSuperuser } from '@/features/users/users.server-utils';

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);

  const users = await userRepository.getAllUsers();

  return { users };
}

export default function UserListPage() {
  const { users } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <main>
      <Table>
        <TableHeader className={'bg-secondary text-secondary-foreground'}>
          <TableRow className={'text-nowrap'}>
            <TableHead>Nazwa użytkownika</TableHead>
            <TableHead>Superużytkownik</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={'bg-accent'}>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.isSuperuser ? <CheckIcon/> : <XIcon/>}</TableCell>
              <TableCell className={'w-full'}>
                <div className={'inline-flex gap-1'}>
                  <Button
                    size={'icon'}
                    variant={'secondary'}
                    className={'gap-1'}
                    asChild
                  >
                    <Link to={user.id.toString()} state={{previousPathname: location.pathname, previousSearch: location.search}}>
                      <EditIcon /> Edytuj
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Outlet />
    </main>
  );
}
