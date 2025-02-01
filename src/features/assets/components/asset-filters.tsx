import { Input } from '@/components/base/input';
import { Card } from '@/components/base/card';
import { useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/utils/styles';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { Label } from '@/components/base/label';

interface AssetFilterProps {
  className?: string;
}

export function AssetFilters({ className }: AssetFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  const debouncedDescriptionFilter = useDebounce(descriptionFilter, 250);
  const [sortingParameter, setSortingParameter] = useState<string>('');

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      ...(debouncedDescriptionFilter && { description: debouncedDescriptionFilter }),
      ...(sortingParameter && { sortBy: sortingParameter })
    }));
  }, [debouncedDescriptionFilter, setSearchParams, sortingParameter]);

  return (
    <Card className={cn('flex flex-col gap-3 bg-secondary text-secondary-foreground', className)}>
      <span className={'font-medium'}>Filtrowanie zawartości</span>
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
          onValueChange={(value) => setSortingParameter(value)}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectOption value={'none'}>Domyślne</SelectOption>
            <SelectOption value={'date'}>Data</SelectOption>
            <SelectOption value={'description'}>Opis</SelectOption>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
