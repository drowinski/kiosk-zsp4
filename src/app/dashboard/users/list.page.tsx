import { userRepository } from '@/features/users/users.repository';
import { Link, useLoaderData } from '@remix-run/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/base/table';
import { Button } from '@/components/base/button';
import { EditIcon, TrashIcon } from '@/components/icons';

export async function loader() {
  const users = await userRepository.getAllUsers();

  return { users };
}

export default function UserListPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <main>
      <Table>
        <TableHeader className={'bg-secondary text-secondary-foreground'}>
          <TableRow className={'text-nowrap'}>
            <TableHead>Nazwa użytkownika</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={'bg-accent'}>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell className={'w-full'}>
                <div className={'inline-flex gap-1'}>
                  <Button
                    size={'icon'}
                    variant={'secondary'}
                    className={'gap-1'}
                    asChild
                  >
                    <Link to={user.id.toString()}><EditIcon /> Zmień hasło</Link>
                  </Button>
                  <Button
                    size={'icon'}
                    variant={'default'}
                    className={'gap-1'}
                  >
                    <TrashIcon /> Usuń
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
