import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Card } from '@/components/base/card';
import { Input } from '@/components/base/input';
import { useDeferredValue, useEffect, useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const description = url.searchParams.get('description');
  console.log(description);
  const assets = await assetRepository.getAllAssets({
    filters: { description: description || undefined },
    sorting: { property: 'date', direction: 'desc' }
  });
  return { assets };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(await request.json());
}

export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname !== nextUrl.pathname) {
    return false;
  }

  return defaultShouldRevalidate;
}

export default function AssetListPage() {
  const { assets } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [descriptionFilter, setDescriptionFilter] = useState(() => searchParams.get('description') ?? '');

  const deferredDescriptionFilter = useDeferredValue(descriptionFilter);

  useEffect(() => {
    setSearchParams({ description: deferredDescriptionFilter });
  }, [deferredDescriptionFilter, setSearchParams]);

  return (
    <main className={'flex h-full flex-col gap-1'}>
      <Card className={'sticky top-0 bg-secondary text-secondary-foreground'}>
        <Input
          type={'text'}
          defaultValue={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          placeholder={'Szukaj...'}
        />
      </Card>
      <AssetList className={'overflow-y-auto'}>
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
          />
        ))}
      </AssetList>
      <Outlet />
    </main>
  );
}
