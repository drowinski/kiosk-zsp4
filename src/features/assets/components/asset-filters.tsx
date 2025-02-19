import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@/hooks/use-search-params';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
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
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDir, setSortDir] = useState<string>('desc');

  const setOrDeleteSearchParam = (searchParams: URLSearchParams, key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  }

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    setOrDeleteSearchParam(newSearchParams, 'description', debouncedDescriptionFilter);
    setOrDeleteSearchParam(newSearchParams, 'sortBy', sortBy);
    setOrDeleteSearchParam(newSearchParams, 'sortDir', sortDir);

    setSearchParams(newSearchParams);
  }, [sortDir, debouncedDescriptionFilter, sortBy, setSearchParams]);

  return (
    <Card className={cn('flex flex-col gap-3 bg-secondary text-secondary-foreground', className)}>
      <span className={'inline-flex items-center gap-2 font-medium'}>
        <FilterIcon /> Filtrowanie
      </span>
      <div className={'flex flex-col gap-2'}>
        <Label>Wyszukiwanie wg. opisu</Label>
        <Input
          type={'text'}
          value={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          placeholder={'Szukaj...'}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <Label>Sortowanie</Label>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value)}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectOption value={'updatedAt'}>Data modyfikacji</SelectOption>
            <SelectOption value={'createdAt'}>Data utworzenia</SelectOption>
            <SelectOption value={'description'}>Opis</SelectOption>
            <SelectOption value={'date'}>Data</SelectOption>
          </SelectContent>
        </Select>
        <Select
          value={sortDir}
          onValueChange={(value) => setSortDir(value)}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectOption value={'asc'}>Rosnąco</SelectOption>
            <SelectOption value={'desc'}>Malejąco</SelectOption>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
