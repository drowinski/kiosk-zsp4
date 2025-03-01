import { Card } from '@/components/base/card';
import { cn } from '@/utils/styles';
import { useSearchParams } from '@remix-run/react';
import { Slider } from '@/components/base/slider';
import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/base/popover';
import { Button } from '@/components/base/button';
import { Label } from '@/components/base/label';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';

interface GalleryFiltersProps {
  className?: string;
}

export function GalleryFilters({ className }: GalleryFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultMinYear = 1915;
  const defaultMaxYear = useMemo(() => new Date().getFullYear(), []);
  const [yearRange, setYearRange] = useState<[number, number]>([
    parseInt(searchParams.get('minYear') ?? '') || defaultMinYear,
    parseInt(searchParams.get('maxYear') ?? '') || defaultMaxYear
  ]);

  return (
    <Card className={cn('flex gap-1 bg-secondary text-secondary-foreground', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Label>
            Zakres dat
            <Button>
              {yearRange[0]} &ndash; {yearRange[1]}
            </Button>
          </Label>
        </PopoverTrigger>
        <PopoverContent
          align={'start'}
          className={'flex w-[480px] gap-2'}
        >
          <Slider
            min={defaultMinYear}
            max={defaultMaxYear}
            value={yearRange}
            onValueChange={([minValue, maxValue]) => {
              setYearRange([minValue, maxValue]);
            }}
            onPointerUp={() =>
              setSearchParams((prev) => {
                if (yearRange[0] === defaultMinYear && yearRange[1] === defaultMaxYear) {
                  prev.delete('minYear');
                  prev.delete('maxYear');
                } else {
                  prev.set('minYear', yearRange[0].toString());
                  prev.set('maxYear', yearRange[1].toString());
                }
                return prev;
              })
            }
          />
          <Button
            onClick={() => {
              setYearRange([defaultMinYear, defaultMaxYear]);
              setSearchParams((prev) => {
                prev.delete('minYear');
                prev.delete('maxYear');
                return prev;
              });
            }}
          >
            Resetuj
          </Button>
        </PopoverContent>
      </Popover>
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
