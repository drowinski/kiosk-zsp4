import { Card } from '@/components/base/card';
import { cn } from '@/utils/styles';
import { useSearchParams } from 'react-router';
import { useMemo } from 'react';
import { Label } from '@/components/base/label';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { RangePicker } from '@/components/range-picker';
import { useDebouncedCallback } from 'use-debounce';

interface GalleryFiltersProps {
  className?: string;
}

export function GalleryFilters({ className }: GalleryFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const minYear = 1915;
  const maxYear = useMemo(() => new Date().getFullYear(), []);

  const updateYearRange = useDebouncedCallback((yearRange: [number, number]) => {
    setSearchParams((prev) => {
      if (yearRange[0] === minYear && yearRange[1] === maxYear) {
        prev.delete('minYear');
        prev.delete('maxYear');
      } else {
        prev.set('minYear', yearRange[0].toString());
        prev.set('maxYear', yearRange[1].toString());
      }
      return prev;
    });
  }, 250);

  return (
    <Card className={cn('flex gap-1 bg-secondary text-secondary-foreground', className)}>
      <RangePicker
        label={'Zakres lat'}
        min={minYear}
        max={maxYear}
        defaultValue={[
          searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : minYear,
          searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : maxYear,
        ]}
        onValueChange={updateYearRange}
      />
      <Label>
        Sortowanie
        <Select
          defaultValue={searchParams.get('sort') || 'date_asc'}
          onValueChange={(value) =>
            setSearchParams((prev) => {
              prev.set('sort', value);
              return prev;
            })
          }
        >
          <SelectTrigger />
          <SelectContent>
            <SelectOption value={'date_asc'}>Od najstarszych</SelectOption>
            <SelectOption value={'date_desc'}>Od najnowszych</SelectOption>
          </SelectContent>
        </Select>
      </Label>
    </Card>
  );
}
