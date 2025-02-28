import { Card } from '@/components/base/card';
import { cn } from '@/utils/styles';
import { useSearchParams } from '@/hooks/use-search-params';
import { Slider } from '@/components/base/slider';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/base/popover';
import { Button } from '@/components/base/button';
import { Label } from '@/components/base/label';

interface GalleryFiltersProps {
  className?: string;
}

export function GalleryFilters({ className }: GalleryFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultMinYear = 1900;
  const defaultMaxYear = useMemo(() => new Date().getFullYear(), []);
  const [yearRange, setYearRange] = useState<[number, number]>([
    parseInt(searchParams.get('minYear') ?? '') || defaultMinYear,
    parseInt(searchParams.get('maxYear') ?? '') || defaultMaxYear
  ]);
  const debouncedYearRange = useDebounce<[number, number]>(yearRange);

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set('minYear', debouncedYearRange[0].toString());
      prev.set('maxYear', debouncedYearRange[1].toString());
      return prev;
    });
  }, [debouncedYearRange, setSearchParams]);

  return (
    <Card className={cn('flex gap-1 bg-secondary text-secondary-foreground', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Label variant={'vertical'}>
            Zakres dat
            <Button>
              {yearRange[0]} &ndash; {yearRange[1]}
            </Button>
          </Label>
        </PopoverTrigger>
        <PopoverContent
          align={'start'}
          className={'w-96'}
        >
          <Slider
            min={1900}
            max={new Date().getFullYear()}
            value={[yearRange[0], yearRange[1]]}
            onValueChange={([minValue, maxValue]) => {
              setYearRange([minValue, maxValue]);
            }}
          />
        </PopoverContent>
      </Popover>
    </Card>
  );
}
