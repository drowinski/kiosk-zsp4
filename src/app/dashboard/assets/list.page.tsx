import { assetRepository } from '@/features/assets/assets.repository';
import { Outlet, useLoaderData } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { ActionFunctionArgs } from '@remix-run/node';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return { assets };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(await request.json());
}

export default function AssetListPage() {
  const { assets } = useLoaderData<typeof loader>();

  return (
    <main className={'flex h-full overflow-y-auto'}>
      <AssetList>
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
          />
        ))}
      </AssetList>
      <Outlet/>
    </main>
  );
}
