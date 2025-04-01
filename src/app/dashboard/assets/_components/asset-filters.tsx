import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@/hooks/use-search-params';
import { cn } from '@/utils/styles';
import { Label } from '@/components/base/label';
import { FilterIcon } from '@/components/icons';
import { Checkbox } from '@/components/base/checkbox';
import { RangePicker } from '@/components/range-picker';
import { useDebouncedCallback } from 'use-debounce';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';

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

  const updateDescription = useDebouncedCallback((description: string) => {
    setSearchParams((prev) => {
      prev.delete('page');
      setOrDeleteSearchParam(prev, 'description', description);
      return prev;
    });
  }, 250);

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
      prev.delete('page');
      setOrDeleteSearchParam(prev, 'minYear', range[0] !== minYear ? range[0].toString() : '');
      setOrDeleteSearchParam(prev, 'maxYear', range[1] !== maxYear ? range[1].toString() : '');
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
            key={searchParams.get('description')}
            type={'text'}
            placeholder={'Opis...'}
            defaultValue={searchParams.get('description') ?? ''}
            onChange={(event) => updateDescription(event.target.value)}
          />
        </Label>
        <fieldset className={'flex flex-col gap-2 pt-2'}>
          <Label asChild>
            <legend>Typy plików</legend>
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              key={searchParams.get('assetType')}
              defaultChecked={searchParams.get('assetType')?.split('_').includes('image')}
              onCheckedChange={(checked) => typeof checked === 'boolean' && onAssetTypeCheckboxChange('image', checked)}
              aria-label={'pokaż zdjęcia'}
            />
            Zdjęcia
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              key={searchParams.get('assetType')}
              defaultChecked={searchParams.get('assetType')?.split('_').includes('video')}
              onCheckedChange={(checked) => typeof checked === 'boolean' && onAssetTypeCheckboxChange('video', checked)}
              aria-label={'pokaż filmy'}
            />
            Filmy
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              key={searchParams.get('assetType')}
              defaultChecked={searchParams.get('assetType')?.split('_').includes('audio')}
              onCheckedChange={(checked) => typeof checked === 'boolean' && onAssetTypeCheckboxChange('audio', checked)}
              aria-label={'pokaż dźwięki'}
            />
            Audio
          </Label>
        </fieldset>
        <Label className={'w-full'}>
          <span className={'inline-flex gap-1'}>Status publikacji</span>
          <Select
            defaultValue={searchParams.get('isPublished') ?? 'none'}
            onValueChange={(value) => {
              setSearchParams((prev) => {
                setOrDeleteSearchParam(prev, 'isPublished', value);
                return prev;
              });
            }}
          >
            <SelectTrigger className={'w-full'}/>
            <SelectContent>
              <SelectOption value={'none'}>Dowolny</SelectOption>
              <SelectOption value={'true'}>Opublikowane</SelectOption>
              <SelectOption value={'false'}>Ukryte</SelectOption>
            </SelectContent>
          </Select>
        </Label>
        <RangePicker
          key={searchParams.get('minYear') + '' + searchParams.get('maxYear')}
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
