import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { useSearchParams } from 'react-router';
import { cn } from '@/utils/styles';

interface AssetSortDropdownProps {
  className?: string;
}

export function AssetSortDropdown({ className }: AssetSortDropdownProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Select
      defaultValue={searchParams.get('sort') || 'updatedAt_desc'}
      onValueChange={(value) =>
        setSearchParams((prev) => {
          prev.delete('page');
          prev.set('sort', value);
          return prev;
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
