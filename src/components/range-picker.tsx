import { Popover, PopoverContent, PopoverTrigger } from '@/components/base/popover';
import { Label } from '@/components/base/label';
import { Button } from '@/components/base/button';
import { Slider } from '@/components/base/slider';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/styles';

interface RangePickerProps {
  label: string;
  min: number;
  max: number;
  defaultValue?: [number, number];
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
}

export function RangePicker({ label, min, max, defaultValue, value, onValueChange }: RangePickerProps) {
  const [range, setRange] = useState<[number, number]>([
    defaultValue?.at(0) ?? value?.at(0) ?? min,
    defaultValue?.at(1) ?? value?.at(1) ?? max
  ]);

  useEffect(() => {
    if (!value) return;
    setRange(value);
  }, [value]);

  const isFullRange = range[0] === min && range[1] === max;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Label>
          {label}
          <Button
            className={cn('border border-accent bg-white text-black')}
          >
            {isFullRange ? 'Ustaw zakres' : `${range[0]} – ${range[1]}`}
          </Button>
        </Label>
      </PopoverTrigger>
      <PopoverContent
        align={'start'}
        className={'flex w-[480px] gap-2 bg-white border-accent'}
      >
        <div className={'flex w-full items-center gap-1'}>
          {min}
          <Slider
            min={min}
            max={max}
            value={range}
            onValueChange={([minValue, maxValue]) => {
              setRange([minValue, maxValue]);
              onValueChange?.([minValue, maxValue]);
            }}
          />
          {max}
        </div>
        <Button
          onClick={() => {
            setRange([min, max]);
            onValueChange?.([min, max]);
          }}
          disabled={isFullRange}
        >
          Resetuj
        </Button>
      </PopoverContent>
    </Popover>
  );
}
