import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { cn } from '@/utils/styles';
import { Label } from '@/components/base/label';
import { AudioIcon, DocumentIcon, FilmIcon, FilterIcon, ImageIcon } from '@/components/icons';
import { Checkbox } from '@/components/base/checkbox';
import { RangePicker } from '@/components/range-picker';
import { useDebouncedCallback } from 'use-debounce';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import {
  createLoader,
  LoaderInput,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState
} from 'nuqs';
import { ASSET_TYPE_ARRAY } from '@/features/assets/assets.constants';
import { assetSchema, AssetType } from '@/features/assets/assets.schemas';
import { Tag, tagSchema } from '@/features/tags/tags.schemas';
import { z } from '@/lib/zod';

export const assetFilterSearchParamsSchema = z.object({
  description: assetSchema.shape.description.optional(),
  tagIds: z.array(tagSchema.shape.id),
  assetType: z.array(assetSchema.shape.assetType),
  isPublished: z.boolean().nullable(),
  minYear: z.coerce
    .number()
    .positive()
    .nullable()
    .transform((minYear) => (minYear ? new Date(minYear, 0, 1) : null)),
  maxYear: z.coerce
    .number()
    .positive()
    .nullable()
    .transform((maxYear) => (maxYear ? new Date(maxYear, 11, 31) : null))
});

export const assetFilterSearchParams = {
  description: parseAsString.withDefault('').withOptions({
    shallow: false
  }),
  tagIds: parseAsArrayOf(parseAsInteger).withDefault([]).withOptions({
    shallow: false
  }),
  assetType: parseAsArrayOf(parseAsStringLiteral(ASSET_TYPE_ARRAY)).withDefault([]).withOptions({
    shallow: false
  }),
  isPublished: parseAsBoolean.withOptions({
    shallow: false
  }),
  minYear: parseAsInteger.withOptions({
    shallow: false
  }),
  maxYear: parseAsInteger.withOptions({
    shallow: false
  })
};

export async function parseAssetFilterSearchParams(input: LoaderInput) {
  return assetFilterSearchParamsSchema.parseAsync(createLoader(assetFilterSearchParams)(input));
}

interface AssetFiltersProps {
  tags?: Tag[];
  yearRangeMin?: number;
  yearRangeMax?: number;
  className?: string;
}

export function AssetFilters({ tags, yearRangeMin = 1900, yearRangeMax = 2025, className }: AssetFiltersProps) {
  const [description, setDescription] = useQueryState('description', assetFilterSearchParams.description);
  const [tagIds, setTagIds] = useQueryState('tagIds', assetFilterSearchParams.tagIds);
  const [assetType, setAssetType] = useQueryState('assetType', assetFilterSearchParams.assetType);
  const [isPublished, setIsPublished] = useQueryState('isPublished', assetFilterSearchParams.isPublished);
  const [minYear, setMinYear] = useQueryState('minYear', assetFilterSearchParams.minYear.withDefault(yearRangeMin));
  const [maxYear, setMaxYear] = useQueryState('maxYear', assetFilterSearchParams.maxYear.withDefault(yearRangeMax));

  const setDescriptionDebounced = useDebouncedCallback(async (description: string) => {
    await setDescription(description);
  }, 250);

  const toggleId = async (id: number, included: boolean) => {
    await setTagIds((prev) => {
      const s = new Set(prev);
      if (included) s.add(id);
      else s.delete(id);
      return Array.from(s);
    });
  };

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
      <div
        role={'group'}
        aria-label={'filtry'}
        className={'flex flex-col gap-3'}
      >
        <span className={'inline-flex items-center gap-2 font-medium'}>
          <FilterIcon /> Filtrowanie
        </span>
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
        <Label>
          Opis
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
              defaultChecked={assetType.includes('image')}
              onCheckedChange={(checked: boolean) => toggleAssetType('image', checked)}
              aria-label={'pokaż zdjęcia'}
            />
            <ImageIcon /> Zdjęcia
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType.includes('video')}
              onCheckedChange={(checked: boolean) => toggleAssetType('video', checked)}
              aria-label={'pokaż filmy'}
            />
            <FilmIcon /> Filmy
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType.includes('document')}
              onCheckedChange={(checked: boolean) => toggleAssetType('document', checked)}
              aria-label={'pokaż dokumenty'}
            />
            <DocumentIcon /> Dokumenty
          </Label>
          <Label variant={'horizontal'}>
            <Checkbox
              defaultChecked={assetType.includes('audio')}
              onCheckedChange={(checked: boolean) => toggleAssetType('audio', checked)}
              aria-label={'pokaż dźwięki'}
            />
            <AudioIcon /> Audio
          </Label>
        </fieldset>
        {tags && (
          <fieldset className={'flex flex-col gap-2 pt-2'}>
            <Label asChild>
              <legend>Tagi</legend>
            </Label>
            {tags.map((tag) => (
              <Label
                key={tag.id}
                variant={'horizontal'}
              >
                <Checkbox
                  defaultChecked={tagIds.includes(tag.id)}
                  onCheckedChange={(checked: boolean) => toggleId(tag.id, checked)}
                  aria-label={'pokaż zdjęcia'}
                />
                {tag.name}
              </Label>
            ))}
          </fieldset>
        )}
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
