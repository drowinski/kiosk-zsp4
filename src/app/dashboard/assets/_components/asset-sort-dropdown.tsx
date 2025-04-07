import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { cn } from '@/utils/styles';
import { parseAsString, useQueryState } from 'nuqs';

interface AssetSortDropdownProps {
  className?: string;
}

export function AssetSortDropdown({ className }: AssetSortDropdownProps) {
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsString.withDefault('updatedAt_desc').withOptions({
      shallow: false,
      clearOnDefault: true
    })
  );

  return (
    <Select
      value={sort}
      onValueChange={setSort}
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
