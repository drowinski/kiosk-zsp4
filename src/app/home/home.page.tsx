import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { db } from '@/lib/db/connection';
import { sql } from 'drizzle-orm';
import { useLoaderData } from '@remix-run/react';
import { requireSession } from '@/features/sessions/sessions.utils';

export const meta: MetaFunction = () => {
  return [{ title: 'Kiosk ZSP4' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireSession(request);
  const result = await db.execute(sql<number>`select 123 as x`);
  return result.rows.at(0)?.x;
}

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  return (
    <main className="flex h-full items-center justify-center">
      <span className={'text-6xl font-extrabold'}>Kiosk ZSP4 {data}</span>
    </main>
  );
}
