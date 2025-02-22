import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@/hooks/use-search-params';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/utils/styles';
import { Label } from '@/components/base/label';
import { FilterIcon } from '@/components/icons';

interface AssetFilterProps {
  className?: string;
}

export function AssetFilters({ className }: AssetFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [descriptionFilter, setDescriptionFilter] = useState('');
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
      prev.delete('page');
      setOrDeleteSearchParam(prev, 'description', debouncedDescriptionFilter);
      return prev;
    });
  }, [debouncedDescriptionFilter, setSearchParams]);

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
      </div>
    </Card>
  );
}
