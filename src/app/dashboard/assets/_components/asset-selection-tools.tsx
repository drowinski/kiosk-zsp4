import { Checkbox } from '@/components/base/checkbox';
import { Button } from '@/components/base/button';
import { Link } from 'react-router';
import { EditIcon } from '@/components/icons';
import { AssetDeleteModal } from '@/app/dashboard/assets/_components/asset-delete-modal';
import { Asset } from '@/features/assets/assets.validation';
import { useEffect, useState } from 'react';

export function useAssetSelection(assets: Asset[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectAsset = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const unselectAsset = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const selectAllAssets = () => {
    setSelectedIds(assets.reduce((set, asset) => set.add(asset.id), new Set<number>()));
  };

  const unselectAllAssets = () => {
    setSelectedIds(new Set());
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      const newSet = new Set<number>();
      for (const id of assets.map((asset) => asset.id)) {
        if (prev.has(id)) {
          newSet.add(id);
        }
      }
      return newSet;
    });
  }, [assets]);

  return { selectedIds, selectAsset, unselectAsset, selectAllAssets, unselectAllAssets };
}

interface AssetSelectionToolsProps extends ReturnType<typeof useAssetSelection> {
  assetCount: number;
  onDelete: (ids: number[]) => void;
}

export function AssetSelectionTools({
  assetCount,
  onDelete,
  selectedIds,
  selectAllAssets,
  unselectAllAssets
}: AssetSelectionToolsProps) {
  return (
    <div className={'flex items-center gap-1'}>
      <Checkbox
        checked={(assetCount > 0 && selectedIds.size === assetCount) || (selectedIds.size > 0 && 'indeterminate')}
        onCheckedChange={(checked) => {
          if (checked === true) {
            selectAllAssets();
          } else if (checked === false) {
            unselectAllAssets();
          }
        }}
        aria-label={'zaznacz wszystkie'}
      />
      {selectedIds.size > 0 && (
        <span className={'mr-1'}>
          {selectedIds.size}/{assetCount}
        </span>
      )}
      {selectedIds.size > 1 && (
        <Button
          className={'gap-1'}
          asChild
        >
          <Link
            to={{
              pathname: 'edit',
              search: 'ids=' + Array.from(selectedIds.values()).join(',')
            }}
            state={{ previousPathname: location.pathname, previousSearch: location.search }}
          >
            <EditIcon />
            <span>Edytuj</span>
          </Link>
        </Button>
      )}
      {selectedIds.size > 0 && (
        <AssetDeleteModal
          assetIds={selectedIds}
          onDelete={() => onDelete(Array.from(selectedIds))}
        />
      )}
    </div>
  );
}
