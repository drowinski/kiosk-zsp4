import { tagRepository } from '@/features/tags/tags.repository';
import { Link, Outlet, useLoaderData, useLocation, useSubmit } from '@remix-run/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/base/table';
import { EditIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/base/button';
import { TagDeleteModal } from '@/app/dashboard/settings/tags/_components/tag-delete-modal';
import { ActionFunctionArgs } from '@remix-run/node';
import { tagSchema } from '@/features/tags/tags.validation';
import { z } from '@/lib/zod';

const tagDeleteRequestSchema = z.object({ id: tagSchema.shape.id });

export async function loader() {
  const tags = await tagRepository.getAllTags();
  return { tags };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === 'DELETE') {
    const formData = await request.json();
    const { data, success } = await tagDeleteRequestSchema.safeParseAsync(formData);
    if (!success) {
      return new Response(null, { status: 400, statusText: 'Bad Request' });
    }
    await tagRepository.deleteTag(data.id);
    return new Response(null, { status: 204, statusText: 'No Content' });
  } else {
    return null;
  }
}

export default function TagListPage() {
  const { tags } = useLoaderData<typeof loader>();
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
          <PlusIcon /> Dodaj tag
        </Link>
      </Button>
      <Table>
        <TableHeader className={'bg-secondary text-secondary-foreground'}>
          <TableRow className={'text-nowrap'}>
            <TableHead>Nazwa</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={'bg-accent'}>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.name}</TableCell>
              <TableCell>
                <div className={'inline-flex gap-1'}>
                  <Button
                    size={'icon'}
                    variant={'secondary'}
                    className={'gap-1'}
                    asChild
                  >
                    <Link
                      to={tag.id.toString()}
                      state={{ previousPathname: location.pathname, previousSearch: location.search }}
                    >
                      <EditIcon /> Zmień nazwę
                    </Link>
                  </Button>
                  <TagDeleteModal
                    tagId={tag.id}
                    tagName={tag.name}
                    onDelete={() => submit({ id: tag.id }, { method: 'DELETE', encType: 'application/json' })}
                  />
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
