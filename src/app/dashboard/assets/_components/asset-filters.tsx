import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { cn } from '@/utils/styles';
import { Label } from '@/components/base/label';
import { FilterIcon } from '@/components/icons';
import { Checkbox } from '@/components/base/checkbox';
import { RangePicker } from '@/components/range-picker';
import { useDebouncedCallback } from 'use-debounce';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState
} from 'nuqs';
import { ASSET_TYPE_ARRAY } from '@/features/assets/assets.constants';
import { AssetType } from '@/features/assets/assets.validation';

interface AssetFilterProps {
  className?: string;
}

export function AssetFilters({ className }: AssetFilterProps) {
  const yearRangeMin = 1915;
  const yearRangeMax = 2025;

  const [description, setDescription] = useQueryState(
    'description',
    parseAsString.withDefault('').withOptions({
      shallow: false,
      clearOnDefault: true
    })
  );
  const [assetType, setAssetType] = useQueryState(
    'assetType',
    parseAsArrayOf(parseAsStringLiteral(ASSET_TYPE_ARRAY)).withDefault([]).withOptions({
      shallow: false,
      clearOnDefault: true
    })
  );
  const [isPublished, setIsPublished] = useQueryState(
    'isPublished',
    parseAsBoolean.withOptions({
      shallow: false,
      clearOnDefault: true
    })
  );
  const [minYear, setMinYear] = useQueryState(
    'minYear',
    parseAsInteger.withDefault(yearRangeMin).withOptions({
      shallow: false,
      clearOnDefault: true
    })
  );
  const [maxYear, setMaxYear] = useQueryState(
    'maxYear',
    parseAsInteger.withDefault(yearRangeMax).withOptions({
      shallow: false,
      clearOnDefault: true
    })
  );

  const setDescriptionDebounced = useDebouncedCallback(async (description: string) => {
    await setDescription(description);
  }, 250);

  const toggleAssetType = async (assetType: AssetType, enabled: boolean) => {
    await setAssetType((prev) => {
      const s = new Set(prev);
      if (enabled) s.add(assetType);
      else s.delete(assetType);
      return Array.from(s);
    });
  };

  const setYearRangeDebounced = useDebouncedCallback(async (range: [number, number]) => {
    await setMinYear(range.at(0) ?? null);
    await setMaxYear(range.at(1) ?? null);
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
            defaultValue={description ?? ''}
            onChange={(event) => setDescriptionDebounced(event.target.value)}
          />
        </Label>
        <fieldset className={'flex flex-col gap-2 pt-2'}>
          <Label asChild>
            <legend>Typy plików</legend>
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType?.includes('image')}
              onCheckedChange={(checked: boolean) => toggleAssetType('image', checked)}
              aria-label={'pokaż zdjęcia'}
            />
            Zdjęcia
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType?.includes('video')}
              onCheckedChange={(checked: boolean) => toggleAssetType('video', checked)}
              aria-label={'pokaż filmy'}
            />
            Filmy
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType?.includes('document')}
              onCheckedChange={(checked: boolean) => toggleAssetType('document', checked)}
              aria-label={'pokaż dokumenty'}
            />
            Dokumenty
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType?.includes('audio')}
              onCheckedChange={(checked: boolean) => toggleAssetType('audio', checked)}
              aria-label={'pokaż dźwięki'}
            />
            Audio
          </Label>
        </fieldset>
        <Label className={'w-full'}>
          Status publikacji
          <Select
            defaultValue={isPublished !== null ? String(isPublished) : 'none'}
            onValueChange={async (value) => {
              await setIsPublished(value === 'true' ? true : value === 'false' ? false : null);
            }}
          >
            <SelectTrigger className={'w-full'} />
            <SelectContent>
              <SelectOption value={'none'}>Dowolny</SelectOption>
              <SelectOption value={'true'}>Opublikowane</SelectOption>
              <SelectOption value={'false'}>Ukryte</SelectOption>
            </SelectContent>
          </Select>
        </Label>
        <RangePicker
          label={'Zakres lat'}
          min={yearRangeMin}
          max={yearRangeMax}
          defaultValue={[minYear, maxYear]}
          onValueChange={setYearRangeDebounced}
        />
      </div>
    </Card>
  );
}
