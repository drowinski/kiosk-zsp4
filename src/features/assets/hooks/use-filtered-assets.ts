import { useMemo, useState } from 'react';
import { Asset } from '@/features/assets/assets.validation';

export interface AssetFilters {
  minDate?: Date;
  maxDate?: Date;
  precision?: number;
}

export interface FilteredAssetsHookReturnType {
  filteredAssets: Asset[];
  filters: AssetFilters;
  setFilter: <T extends keyof AssetFilters>(filterName: T, value: AssetFilters[T]) => void;
}

export function useFilteredAssets(assets: Asset[]): FilteredAssetsHookReturnType {
  const [filters, setFilters] = useState<AssetFilters>({});

  const setFilter = <T extends keyof AssetFilters>(filterName: T, value: AssetFilters[T]) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value
    }));
  };

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset: Asset) => {
        if (asset.date) {
          if (filters.minDate && asset.date.dateMax < filters.minDate) {
            return false;
          }
          if (filters.maxDate && asset.date.dateMin > filters.maxDate) {
            return false;
          }
        } else if (filters.minDate || filters.maxDate) {
          return false;
        }

        return true;
      }),
    [assets, filters.maxDate, filters.minDate]
  );

  return { filteredAssets, filters, setFilter };
}
