import { assetRepository } from '@/features/assets/assets.repository';
import { useLoaderData } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return { assets };
}

export default function AssetManagementPage() {
  const { assets } = useLoaderData<typeof loader>();

  return (
    <main className={'flex h-full overflow-y-auto'}>
      <AssetList>
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
            onCommitChanges={(assetChanges) => console.log(assetChanges)}
          />
        ))}
      </AssetList>
    </main>
  );
}
