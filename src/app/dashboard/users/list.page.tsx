import { userRepository } from '@/features/users/users.repository';
import { Link, Outlet, useLoaderData, useLocation, useSubmit } from '@remix-run/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/base/table';
import { Button } from '@/components/base/button';
import { CheckIcon, EditIcon, PlusIcon, XIcon } from '@/components/icons';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getSession } from '@/features/sessions/sessions.server-utils';
import { requireSuperuser } from '@/features/users/users.server-utils';
import { UserDeleteModal } from '@/app/dashboard/users/_components/user-delete-modal';
import { updateUserSchema } from '@/features/users/users.validation';

const userDeleteRequestSchema = updateUserSchema.pick({ id: true });

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);

  const users = await userRepository.getAllUsers();

  return { users, session: session.data };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);

  if (request.method === 'DELETE') {
    const formData = await request.json();
    const { data, success } = await userDeleteRequestSchema.safeParseAsync(formData);
    if (!success) {
      return new Response(null, { status: 400, statusText: 'Bad Request' });
    }
    if (data.id === session.data.userId) {
      return new Response(null, { status: 400, statusText: 'Bad Request' });
    }
    await userRepository.deleteUser(data.id);
    return new Response(null, { status: 200, statusText: 'OK' });
  } else {
    return null;
  }
}

export default function UserListPage() {
  const { users, session } = useLoaderData<typeof loader>();
  const location = useLocation();
  const submit = useSubmit();

  return (
    <main className={'flex flex-col gap-1'}>
      <Button
        className={'flex items-center gap-2'}
        asChild
      >
        <Link to={'create'}>
          <PlusIcon /> Dodaj użytkownika
        </Link>
      </Button>
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
              <TableCell>{user.isSuperuser ? <CheckIcon /> : <XIcon />}</TableCell>
              <TableCell>
                <div className={'inline-flex gap-1'}>
                  <Button
                    size={'icon'}
                    variant={'secondary'}
                    className={'gap-1'}
                    asChild
                  >
                    <Link
                      to={user.id.toString()}
                      state={{ previousPathname: location.pathname, previousSearch: location.search }}
                    >
                      <EditIcon /> Edytuj
                    </Link>
                  </Button>
                  {session.userId !== user.id && (
                    <UserDeleteModal
                      userId={user.id}
                      username={user.username}
                      onDelete={() => submit({ id: user.id }, { method: 'DELETE', encType: 'application/json' })}
                    />
                  )}
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
