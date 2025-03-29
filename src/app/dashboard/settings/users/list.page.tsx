import { userRepository } from '@/features/users/users.repository';
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useSubmit,
  ActionFunctionArgs,
  LoaderFunctionArgs
} from 'react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/base/table';
import { Button } from '@/components/base/button';
import { CheckIcon, EditIcon, PlusIcon, XIcon } from '@/components/icons';
import { UserDeleteModal } from '@/app/dashboard/settings/users/_components/user-delete-modal';
import { updateUserSchema } from '@/features/users/users.validation';
import { status, StatusCodes } from '@/utils/status-response';

const userDeleteRequestSchema = updateUserSchema.pick({ id: true });

export async function loader({ context: { session } }: LoaderFunctionArgs) {
  if (!session || !session.user.isSuperuser) {
    throw status(StatusCodes.FORBIDDEN);
  }

  const users = await userRepository.getAllUsers();

  return { users, session: { user: session.user } };
}

export async function action({ request, context: { session } }: ActionFunctionArgs) {
  if (!session || !session.user.isSuperuser) {
    throw status(StatusCodes.FORBIDDEN);
  }

  if (request.method === 'DELETE') {
    const formData = await request.json();
    const { data, success } = await userDeleteRequestSchema.safeParseAsync(formData);
    if (!success) {
      return status(StatusCodes.BAD_REQUEST);
    }
    if (data.id === session.user.id) {
      return status(StatusCodes.BAD_REQUEST);
    }
    await userRepository.deleteUser(data.id);
    return status(StatusCodes.NO_CONTENT);
  } else {
    return null;
  }
}

export default function UserListPage() {
  const { users, session } = useLoaderData<typeof loader>();
  const location = useLocation();
  const submit = useSubmit();

  return (
    <main className={'flex flex-col gap-1 p-2'}>
      <Button
        className={'flex items-center gap-2'}
        asChild
      >
        <Link
          to={'create'}
          state={{ previousPathname: location.pathname, previousSearch: location.search }}
        >
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
              <TableCell>
                {user.username}
                {session.user.id === user.id && <span className={'font-bold text-muted'}> (twoje konto)</span>}
              </TableCell>
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
                  {session.user.id !== user.id && (
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
