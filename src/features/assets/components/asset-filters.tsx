import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@/hooks/use-search-params';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/utils/styles';
import { Label } from '@/components/base/label';
import { FilterIcon } from '@/components/icons';
import { Checkbox } from '@/components/base/checkbox';
import { RangePicker } from '@/components/range-picker';
import { useDebouncedCallback } from 'use-debounce';

interface AssetFilterProps {
  className?: string;
}

export function AssetFilters({ className }: AssetFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const setOrDeleteSearchParam = (searchParams: URLSearchParams, key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  };

  const [descriptionFilter, setDescriptionFilter] = useState(searchParams.get('description') || '');
  const debouncedDescriptionFilter = useDebounce<string>(descriptionFilter);

  useEffect(() => {
    setSearchParams((prev) => {
      if ((prev.get('description') ?? '') !== debouncedDescriptionFilter) {
        prev.delete('page');
      }
      setOrDeleteSearchParam(prev, 'description', debouncedDescriptionFilter);
      return prev;
    });
  }, [debouncedDescriptionFilter, setSearchParams]);

  const onAssetTypeCheckboxChange = (value: string, checked: boolean) => {
    const assetTypeParam = searchParams.get('assetType');
    const assetTypes = assetTypeParam?.split('_') || [];
    if (!checked && assetTypes.includes(value)) {
      assetTypes.splice(assetTypes.indexOf(value), 1);
    } else if (checked && !assetTypes.includes(value)) {
      assetTypes.push(value);
    }
    setSearchParams((prev) => {
      prev.delete('page');
      setOrDeleteSearchParam(prev, 'assetType', assetTypes.join('_'));
      return prev;
    });
  };

  const minYear = 1915;
  const maxYear = 2025;

  const updateYearRange = useDebouncedCallback((range: [number, number]) => {
    setSearchParams((prev) => {
      if (range[0] === minYear && range[1] === maxYear) {
        prev.delete('minYear');
        prev.delete('maxYear');
      } else {
        prev.set('minYear', range[0].toString());
        prev.set('maxYear', range[1].toString());
      }
      return prev;
    });
  }, 250);

  return (
    <Card className={cn('flex h-fit flex-col gap-2 bg-secondary text-secondary-foreground', className)}>
      <span className={'inline-flex items-center gap-2 font-medium'}>
        <FilterIcon /> Filtrowanie
      </span>
      <div
        role={'group'}
        aria-label={'filtry'}
        className={'flex flex-col gap-3'}
      >
        <Label>
          Według opisu
          <Input
            type={'text'}
            placeholder={'Opis...'}
            value={descriptionFilter}
            onChange={(event) => setDescriptionFilter(event.target.value)}
          />
        </Label>
        <div
          role={'group'}
          className={'flex flex-col gap-2'}
        >
          <Label asChild>
            <legend>Typy plików</legend>
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={searchParams.get('assetType')?.split('_').includes('image')}
              onCheckedChange={(checked) => typeof checked === 'boolean' && onAssetTypeCheckboxChange('image', checked)}
            />
            Zdjęcia
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={searchParams.get('assetType')?.split('_').includes('video')}
              onCheckedChange={(checked) => typeof checked === 'boolean' && onAssetTypeCheckboxChange('video', checked)}
            />
            Filmy
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={searchParams.get('assetType')?.split('_').includes('audio')}
              onCheckedChange={(checked) => typeof checked === 'boolean' && onAssetTypeCheckboxChange('audio', checked)}
            />
            Audio
          </Label>
        </div>
        <RangePicker
          label={'Zakres lat'}
          min={minYear}
          max={maxYear}
          defaultValue={[
            searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : minYear,
            searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : maxYear
          ]}
          onValueChange={updateYearRange}
        />
      </div>
    </Card>
  );
}
