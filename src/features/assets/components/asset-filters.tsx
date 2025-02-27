import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@/hooks/use-search-params';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/utils/styles';
import { Label } from '@/components/base/label';
import { FilterIcon } from '@/components/icons';
import { Checkbox } from '@/components/base/checkbox';

interface AssetFilterProps {
  className?: string;
}

export function AssetFilters({ className }: AssetFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [descriptionFilter, setDescriptionFilter] = useState(searchParams.get('description') || '');
  const debouncedDescriptionFilter = useDebounce<string>(descriptionFilter);

  const setOrDeleteSearchParam = (searchParams: URLSearchParams, key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  };

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

  return (
    <Card className={cn('flex h-fit flex-col gap-2 bg-secondary text-secondary-foreground', className)}>
      <span className={'inline-flex items-center gap-2 font-medium'}>
        <FilterIcon /> Filtrowanie
      </span>
      <div className={'flex flex-col gap-2'}>
        <Label>Według opisu</Label>
        <Input
          type={'text'}
          placeholder={'Opis...'}
          value={descriptionFilter}
          onChange={(event) => setDescriptionFilter(event.target.value)}
        />
        <Label>Typy plików</Label>
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
    </Card>
  );
}
