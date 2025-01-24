import { NewAssetDate, AssetDatePrecision } from '@/features/assets/assets.validation';
import React, { useEffect, useMemo, useState } from 'react';
import { DATE_PRECISION_ARRAY } from '@/features/assets/assets.constants';
import { MONTHS_IN_POLISH } from '@/lib/constants';
import { getYYYYMMDD } from '@/utils/dates';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { Input } from '@/components/base/input';
import { SelectOption, Select, SelectContent, SelectTrigger } from '@/components/base/select';
import { cn } from '@/utils/styles';

export interface AssetDatePrecisionComboboxProps {
  name: string;
  defaultValue: AssetDatePrecision;
  value: AssetDatePrecision;
  onChange: (value: AssetDatePrecision) => void;
}

export function AssetDatePrecisionCombobox({ name, defaultValue, value, onChange }: AssetDatePrecisionComboboxProps) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      value={value}
      onValueChange={(value) => onChange(value as AssetDatePrecision)}
    >
      <SelectTrigger />
      <SelectContent>
        {DATE_PRECISION_ARRAY.map((precision) => (
          <SelectOption
            key={precision}
            value={precision}
          >
            {precision}
          </SelectOption>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface DatePickerProps {
  precision: AssetDatePrecision;
  name: string;
  defaultValue: Date;
  value: Date;
  onChange: (value: Date) => void;
  hidden?: boolean;
}

export function DatePicker({ precision, name, defaultValue, value, onChange, hidden = false }: DatePickerProps) {
  const [yearString, setYearString] = useState<string>(defaultValue.getFullYear().toString());

  useEffect(() => {
    setYearString(value.getFullYear().toString());
  }, [value]);

  return (
    <div
      hidden={hidden}
      aria-hidden={hidden}
    >
      <Input
        name={name}
        type={'date'}
        value={getYYYYMMDD(value)}
        onChange={(event) => {
          onChange(new Date(event.currentTarget.value));
        }}
        hidden={precision !== 'day'}
        aria-hidden={precision !== 'day'}
      />
      {precision === 'month' && (
        <Select
          value={value.getMonth().toString()}
          onValueChange={(monthIndex) => {
            onChange(new Date(value.getFullYear(), parseInt(monthIndex), value.getDate()));
          }}
        >
          <SelectTrigger className={'rounded-r-none'} />
          <SelectContent>
            {MONTHS_IN_POLISH.map((value, index) => (
              <SelectOption
                key={index}
                value={index.toString()}
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
          maxLength={4}
          min={1800}
          max={new Date().getFullYear()}
          value={yearString}
          onChange={(event) => {
            const year = event.target.value;
            setYearString((prev) => (year.length <= 4 ? year : prev));
            if (year.length === 4) {
              onChange(new Date(parseInt(year), value.getMonth(), value.getDate()));
            }
          }}
          className={cn(precision === 'month' && 'rounded-l-none')}
        />
      )}
    </div>
  );
}

type AssetDatePickerProp<K extends keyof NewAssetDate> = {
  name: string;
  defaultValue: NewAssetDate[K];
  value: NewAssetDate[K];
  onChange: (value: NewAssetDate[K]) => void;
};

export interface AssetDatePickerProps {
  dateMin: AssetDatePickerProp<'dateMin'>;
  dateMax: AssetDatePickerProp<'dateMax'>;
  datePrecision: AssetDatePickerProp<'datePrecision'>;
  // dateIsRange: AssetDatePickerProp<'dateIsRange'>;
}

export function AssetDatePicker({ dateMin, dateMax, datePrecision }: AssetDatePickerProps) {
  const [precision, setPrecision] = React.useState<AssetDatePrecision>(datePrecision.defaultValue || 'day');
  const [isMinMaxDate, setIsMinMaxDate] = React.useState(dateMin.value.toDateString() != dateMax.value.toDateString());
  const [lastMaxDate, setLastMaxDate] = React.useState<Date | null>(dateMax.defaultValue);

  const Picker = useMemo(() => {
    if (['year', 'month', 'day'].includes(precision)) {
      return DatePicker;
    } else {
      return DatePicker;
    }
  }, [precision]);

  const toggleIsMinMaxDate = () => {
    const _isMinMaxDate = !isMinMaxDate;
    if (_isMinMaxDate) {
      dateMax.onChange(lastMaxDate || dateMin.value);
      setLastMaxDate(null);
    } else {
      setLastMaxDate(dateMax.value);
      dateMax.onChange(dateMin.value);
    }
    setIsMinMaxDate(_isMinMaxDate);
  };

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex items-center gap-2'}>
        <Picker
          name={dateMin.name}
          defaultValue={dateMin.defaultValue}
          value={dateMin.value}
          onChange={(value) => {
            if (!isMinMaxDate) {
              dateMax.onChange(value);
            }
            dateMin.onChange(value);
          }}
          precision={precision}
        />
        {isMinMaxDate && <span>&mdash;</span>}
        <Picker
          name={dateMax.name}
          defaultValue={dateMax.defaultValue}
          value={dateMax.value}
          onChange={dateMax.onChange}
          precision={precision}
          hidden={!isMinMaxDate}
        />
        <div
          role={'checkbox'}
          aria-checked={isMinMaxDate}
          tabIndex={0}
          onClick={toggleIsMinMaxDate}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && toggleIsMinMaxDate()}
          className={cn(
            'flex h-full items-center justify-center rounded-xl bg-accent p-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
          )}
        >
          {isMinMaxDate ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </div>
      </div>
      <AssetDatePrecisionCombobox
        name={datePrecision.name}
        defaultValue={datePrecision.defaultValue}
        value={datePrecision.value}
        onChange={(precision) => {
          setPrecision(precision);
          datePrecision.onChange(precision);
        }}
      />
    </div>
  );
}
