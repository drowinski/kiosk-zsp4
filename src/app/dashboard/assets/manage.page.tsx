import { assetRepository } from '@/features/assets/assets.repository';
import { useLoaderData } from '@remix-run/react';
import { AssetList, AssetListItem } from '@/features/assets/components/asset-list';
import { useMemo } from 'react';
import { Asset } from '@/features/assets/assets.validation';
import { ActionFunctionArgs } from '@remix-run/node';

export async function loader() {
  const assets = await assetRepository.getAllAssets();
  return { assets };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(await request.json());
}

export default function AssetManagementPage() {
  const { assets } = useLoaderData<typeof loader>();
  const assetChangesMap = useMemo<Map<Asset['id'], Partial<Asset>>>(() => new Map(), []);

  const handleAssetChange = (id: Asset['id'], assetChanges: Partial<Asset>) => {
    if (Object.keys(assetChanges).length === 0) {
      assetChangesMap.delete(id);
    } else {
      assetChangesMap.set(id, assetChanges);
    }
    console.log(assetChangesMap);
  };

  const handleCommitAssetChanges = (id: Asset['id'], assetChanges: Partial<Asset>) => {

  };

  return (
    <main className={'flex h-full overflow-y-auto'}>
      <AssetList>
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
            onCommitChanges={(assetChanges) => console.log(assetChanges)}
            onChange={(assetChanges) => handleAssetChange(asset.id, assetChanges)}
          />
        ))}
      </AssetList>
    </main>
  );
}
