import { Checkbox } from '@/components/base/checkbox';
import { Button } from '@/components/base/button';
import { Link, LinkProps } from 'react-router';
import { EditIcon, MinusIcon, PlusIcon, TagIcon } from '@/components/icons';
import { AssetDeleteModal } from '@/app/dashboard/assets/_components/asset-delete-modal';
import { Asset } from '@/features/assets/assets.validation';
import { useEffect, useMemo, useState } from 'react';
import { TagCombobox } from '@/features/tags/components/tag-selector';
import { Tag } from '@/features/tags/tags.validation';
import { cn } from '@/utils/styles';

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
  assets: Asset[];
  tags: Tag[];
  onDelete: (ids: number[]) => void;
  onAddTag: (assetIds: number[], tagId: number) => void;
  onRemoveTag: (assetIds: number[], tagId: number) => void;
  editPageLinkProps: LinkProps | ((selectedIds: number[]) => LinkProps);
}

export function AssetSelectionTools({
  selectedIds,
  selectAllAssets,
  unselectAllAssets,
  assets,
  tags,
  onDelete,
  onAddTag,
  onRemoveTag,
  editPageLinkProps
}: AssetSelectionToolsProps) {
  const tagsInSelectedAssets = useMemo(
    () =>
      Array.from(
        assets
          .filter((asset) => selectedIds.has(asset.id))
          .reduce<Map<number, Tag>>((tags, asset) => {
            asset.tags.forEach((tag) => tags.set(tag.id, tag));
            return tags;
          }, new Map())
          .values()
      ),
    [assets, selectedIds]
  );

  return (
    <div className={'flex items-center gap-1'}>
      <Checkbox
        checked={(assets.length > 0 && selectedIds.size === assets.length) || (selectedIds.size > 0 && 'indeterminate')}
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
        <span className={'mx-1'}>
          {selectedIds.size}/{assets.length}
        </span>
      )}
      {selectedIds.size > 0 && (
        <div className={'flex items-center'}>
          <Button
            className={'gap-1 rounded-r-none border-r border-secondary'}
            asChild
            aria-hidden
          >
            <div>
              <TagIcon /> Tagi
            </div>
          </Button>
          <TagCombobox
            tags={tags}
            onSelect={(tagId: number) => onAddTag(Array.from(selectedIds), tagId)}
            triggerButton={
              <Button
                className={cn(
                  'gap-1 rounded-l-none',
                  tagsInSelectedAssets.length > 0 && 'rounded-r-none border-r border-r-secondary'
                )}
                aria-label={'Dodaj tag'}
              >
                <PlusIcon />
              </Button>
            }
            icon={<PlusIcon />}
          />
          {tagsInSelectedAssets.length > 0 && (
            <TagCombobox
              tags={tagsInSelectedAssets}
              onSelect={(tagId: number) => onRemoveTag(Array.from(selectedIds), tagId)}
              triggerButton={
                <Button
                  className={'gap-1 rounded-l-none'}
                  aria-label={'Usuń tag'}
                >
                  <MinusIcon />
                </Button>
              }
              icon={<MinusIcon />}
            />
          )}
        </div>
      )}
      {selectedIds.size > 1 && (
        <Button
          className={'gap-1'}
          asChild
        >
          <Link
            {...(typeof editPageLinkProps === 'function'
              ? editPageLinkProps(Array.from(selectedIds))
              : editPageLinkProps)}
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
