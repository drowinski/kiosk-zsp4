import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { cn } from '@/utils/styles';
import { createLoader, LoaderInput, parseAsString, useQueryStates } from 'nuqs';
import { z } from '@/lib/zod';

export const assetSortSearchParamsSchema = z.object({
  sortBy: z.enum(['updatedAt' , 'description' , 'date' , 'createdAt']),
  sortDir: z.enum(['asc', 'desc'])
});

export const assetSortSearchParams = {
  sortBy: parseAsString.withDefault('updatedAt').withOptions({ shallow: false }),
  sortDir: parseAsString.withDefault('desc').withOptions({ shallow: false })
};

export function parseAssetSortSearchParams(input: LoaderInput) {
  return assetSortSearchParamsSchema.parseAsync(createLoader(assetSortSearchParams)(input));
}

interface AssetSortDropdownProps {
  className?: string;
}

export function AssetSortDropdown({ className }: AssetSortDropdownProps) {
  const [sort, setSort] = useQueryStates(assetSortSearchParams);

  return (
    <Select
      defaultValue={Object.values(sort).join('_')}
      onValueChange={(value) =>
        setSort({
          sortBy: value.split('_')[0],
          sortDir: value.split('_')[1]
        })
      }
    >
      <SelectTrigger className={'min-w-64'} />
      <SelectContent
        position={'popper'}
        className={cn('min-w-72', className)}
      >
        <SelectOption value={'description_asc'}>Opis: od A do Z</SelectOption>
        <SelectOption value={'description_desc'}>Opis: od Z do A</SelectOption>
        <SelectOption value={'date_desc'}>Data: od najnowszych</SelectOption>
        <SelectOption value={'date_asc'}>Data: od najstarszych</SelectOption>
        <SelectOption value={'updatedAt_desc'}>Data modyfikacji: od najnowszych</SelectOption>
        <SelectOption value={'updatedAt_asc'}>Data modyfikacji: od najstarszych</SelectOption>
        <SelectOption value={'createdAt_desc'}>Data dodania: od najnowszych</SelectOption>
        <SelectOption value={'createdAt_asc'}>Data dodania: od najstarszych</SelectOption>
      </SelectContent>
    </Select>
  );
}
