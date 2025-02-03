import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/utils/styles';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { Label } from '@/components/base/label';
import { FilterIcon } from '@/components/icons';

interface AssetFilterProps {
  className?: string;
}

export function AssetFilters({ className }: AssetFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  const debouncedDescriptionFilter = useDebounce(descriptionFilter, 250);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDir, setSortDir] = useState<string>('');

  useEffect(() => {
    if (debouncedDescriptionFilter) {
      searchParams.set('description', debouncedDescriptionFilter);
    } else {
      searchParams.delete('description');
    }

    if (sortBy) {
      searchParams.set('sortBy', sortBy);
    } else {
      searchParams.delete('sortBy');
    }

    if (sortDir) {
      searchParams.set('sortDir', sortDir);
    } else {
      searchParams.delete('sortDir');
    }

    setSearchParams(searchParams);
  }, [sortDir, debouncedDescriptionFilter, setSearchParams, sortBy, searchParams]);

  return (
    <Card className={cn('flex flex-col gap-3 bg-secondary text-secondary-foreground', className)}>
      <span className={'inline-flex items-center gap-2 font-medium'}>
        <FilterIcon /> Filtrowanie
      </span>
      <div className={'flex flex-col gap-2'}>
        <Label>Wyszukiwanie wg. opisu</Label>
        <Input
          type={'text'}
          defaultValue={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          placeholder={'Szukaj...'}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <Label>Sortowanie</Label>
        <Select
          defaultValue={'none'}
          onValueChange={(value) => setSortBy(value)}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectOption value={'none'}>Domyślne</SelectOption>
            <SelectOption value={'date'}>Data</SelectOption>
            <SelectOption value={'description'}>Opis</SelectOption>
          </SelectContent>
        </Select>
        <Select
          defaultValue={'asc'}
          onValueChange={(value) => setSortDir(value)}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectOption value={'asc'}>Rosnąco</SelectOption>
            <SelectOption value={'desc'}>Malejęco</SelectOption>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
