import { AssetDatePrecision, NewAssetDate } from '@/features/assets/assets.validation';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { DATE_PRECISION_ARRAY, DATE_PRECISION_ARRAY_IN_POLISH, MONTHS_IN_POLISH } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { Input } from '@/components/base/input';
import { cn } from '@/utils/styles';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

export interface AssetDatePrecisionComboboxProps {
  name?: string;
  defaultValue?: AssetDatePrecision;
  value?: AssetDatePrecision;
  onValueChange?: (value: AssetDatePrecision) => void;
}

export function AssetDatePrecisionCombobox({
  name,
  defaultValue,
  value,
  onValueChange
}: AssetDatePrecisionComboboxProps) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      value={value}
      onValueChange={(value) => onValueChange?.(value as AssetDatePrecision)}
    >
      <SelectTrigger />
      <SelectContent>
        {DATE_PRECISION_ARRAY.map((precision, index) => (
          <SelectOption
            key={precision}
            value={precision}
          >
            {DATE_PRECISION_ARRAY_IN_POLISH[index]}
          </SelectOption>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface DatePickerProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  precision?: AssetDatePrecision;
  hidden?: boolean;
}

export function DatePicker({
  name,
  value,
  defaultValue,
  onValueChange,
  precision = 'day',
  hidden = false
}: DatePickerProps) {
  const [date, setDate] = useState<string>(defaultValue ?? value ?? '');

  useEffect(() => {
    setDate(value ?? '');
  }, [value]);

  const year = date.split('-').at(0) || '';
  const month = date.split('-').at(1) || '';

  const updateDate = ({ year, month, day }: { [key: string]: string }) => {
    setDate((prev) => {
      const prevSplit = prev.split('-');
      const values = [
        year || prevSplit.at(0) || defaultValue?.split('-')?.at(0) || new Date().getUTCFullYear(),
        month || prevSplit.at(1) || '01',
        day || prevSplit.at(2) || '01'
      ];
      const date = values.join('-');
      onValueChange?.(date);
      return date;
    });
  };

  return (
    <div
      hidden={hidden}
      aria-hidden={hidden}
    >
      <Input
        name={name}
        type={'date'}
        value={date}
        onChange={(event) => {
          setDate(event.target.value);
          onValueChange?.(event.target.value);
        }}
        onBlur={(event) => {
          if (date === '') {
            event.currentTarget.value = '';
          }
        }}
        hidden={precision !== 'day'}
        aria-hidden={precision !== 'day'}
      />
      {precision === 'month' && (
        <Select
          value={month ? parseInt(month).toString() : ''}
          onValueChange={(monthIndex) => {
            updateDate({ month: parseInt(monthIndex).toString().padStart(2, '0') });
          }}
        >
          <SelectTrigger
            className={'rounded-r-none'}
            placeholder={'miesiąc'}
          />
          <SelectContent>
            {MONTHS_IN_POLISH.map((value, index) => (
              <SelectOption
                key={index + 1}
                value={String(index + 1)}
              >
                {value}
              </SelectOption>
            ))}
          </SelectContent>
        </Select>
      )}
      {['year', 'month'].includes(precision) && (
        <Input
          type={'number'}
          placeholder={'rok'}
          min={0}
          max={9999}
          maxLength={4}
          value={parseInt(year).toString()}
          onChange={(event) => {
            updateDate({ year: event.target.value.padStart(4, '0') });
          }}
          className={cn(precision === 'month' && 'rounded-l-none')}
        />
      )}
    </div>
  );
}

type StringifiedNewAssetDate = Omit<Omit<NewAssetDate, 'dateMin'>, 'dateMax'> & { dateMin: string; dateMax: string };

type AssetDatePickerProp<K extends keyof StringifiedNewAssetDate> = {
  name?: string;
  defaultValue?: StringifiedNewAssetDate[K];
  value?: StringifiedNewAssetDate[K];
  onChange?: (value: StringifiedNewAssetDate[K]) => void;
};

export interface AssetDatePickerProps {
  dateMin?: AssetDatePickerProp<'dateMin'>;
  dateMax?: AssetDatePickerProp<'dateMax'>;
  datePrecision?: AssetDatePickerProp<'datePrecision'>;
}

export function AssetDatePicker({ dateMin, dateMax, datePrecision }: AssetDatePickerProps) {
  const [precision, setPrecision] = useState<AssetDatePrecision>(
    datePrecision?.defaultValue || datePrecision?.value || 'day'
  );
  const [isRange, setIsRange] = useState<boolean>(dateMin?.defaultValue !== dateMax?.defaultValue);
  const [minDate, setMinDate] = useState<string>(dateMin?.defaultValue || dateMin?.value || '');
  const [maxDate, setMaxDate] = useState<string>(dateMax?.defaultValue || dateMax?.value || '');
  const [latestMaxDate, setLatestMaxDate] = useState<string>(maxDate);

  const toggleIsRange = () => {
    if (!isRange) {
      setMaxDate(latestMaxDate);
      dateMax?.onChange?.(latestMaxDate);
      setIsRange(true);
    } else {
      setLatestMaxDate(maxDate);
      setIsRange(false);
      setMaxDate(minDate);
      dateMax?.onChange?.(minDate);
    }
  };

  return (
    <div className={'flex flex-col gap-1'}>
      <div className={'flex items-center gap-1'}>
        {/* TODO: hidden ID input */}
        <DatePicker
          name={dateMin?.name}
          value={minDate}
          onValueChange={(value) => {
            setMinDate(value);
            dateMin?.onChange?.(value);
            if (!isRange) {
              setMaxDate(value);
              dateMax?.onChange?.(value);
            }
          }}
          precision={precision}
        />
        <DatePicker
          name={dateMax?.name}
          value={maxDate}
          onValueChange={(value) => {
            setMaxDate(value);
            dateMax?.onChange?.(value);
          }}
          precision={precision}
          hidden={!isRange}
        />
        <div
          role={'checkbox'}
          aria-checked={isRange}
          tabIndex={0}
          onClick={toggleIsRange}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && toggleIsRange()}
          className={cn(
            'flex h-full items-center justify-center rounded-xl bg-accent p-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
          )}
        >
          {isRange ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </div>
      </div>
      <AssetDatePrecisionCombobox
        name={datePrecision?.name}
        value={precision}
        onValueChange={(value) => {
          setPrecision(value);
          datePrecision?.onChange?.(value);
        }}
      />
    </div>
  );
}
