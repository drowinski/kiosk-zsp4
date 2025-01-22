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
  key?: string;
  name?: string;
  defaultValue?: AssetDatePrecision;
  onChange?: (value: AssetDatePrecision) => void;
}

export function AssetDatePrecisionCombobox({ key, name, defaultValue, onChange }: AssetDatePrecisionComboboxProps) {
  return (
    <Select
      key={key}
      name={name}
      defaultValue={defaultValue}
      value={defaultValue}
      onValueChange={(value) => onChange && onChange(value as AssetDatePrecision)}
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
  key?: string;
  name?: string;
  defaultValue?: Date;
  onChange?: (value: string) => void;
  hidden?: boolean;
}

export function DatePicker({ precision, key, name, defaultValue, onChange, hidden = false }: DatePickerProps) {
  const [date, setDate] = useState<Date>(defaultValue || new Date());
  const [yearString, setYearString] = useState<string>(date.getFullYear().toString());
  // const [month, setMonth] = useState<number>(date.getMonth());
  // const [day, setDay] = useState<number>(date.getDate());

  useEffect(() => {
    if (onChange) {
      onChange(getYYYYMMDD(date));
      console.log(getYYYYMMDD(date));
    }
  }, [date, onChange]);

  return (
    <div
      hidden={hidden}
      aria-hidden={hidden}
    >
      <Input
        type={'date'}
        key={key}
        name={name}
        value={getYYYYMMDD(date)}
        onChange={(event) => setDate(new Date(event.currentTarget.value))}
        hidden={precision !== 'day'}
        aria-hidden={precision !== 'day'}
      />
      {precision === 'month' && (
        <Select
          value={date.getMonth().toString()}
          onValueChange={(value) => setDate((prev) => new Date(prev.getFullYear(), parseInt(value), prev.getDate()))}
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
            const value = event.target.value;
            setYearString((prev) => (value.length <= 4 ? value : prev));
            if (value.length === 4) {
              setDate((prev) => new Date(parseInt(event.target.value), prev.getMonth(), prev.getDate()));
            }
          }}
          className={cn(precision === 'month' && 'rounded-l-none')}
        />
      )}
    </div>
  );
}

export interface AssetDatePickerProps {
  formParams: {
    [K in keyof NewAssetDate]?: {
      key?: string;
      name?: string;
      defaultValue?: NewAssetDate[K];
      onChange?: (value: string) => void;
    };
  };
}

export function AssetDatePicker({ formParams }: AssetDatePickerProps) {
  const [precision, setPrecision] = React.useState<AssetDatePrecision>(formParams.datePrecision?.defaultValue || 'day');
  const [isMinMaxDate, setIsMinMaxDate] = React.useState(false);

  const Picker = useMemo(() => {
    if (['year', 'month', 'day'].includes(precision)) {
      return DatePicker;
    } else {
      return DatePicker;
    }
  }, [precision]);

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex items-center gap-2'}>
        <Picker
          key={formParams?.dateMin?.key}
          name={formParams?.dateMin?.name}
          defaultValue={formParams?.dateMin?.defaultValue}
          onChange={formParams?.dateMin?.onChange}
          precision={precision}
        />
        {isMinMaxDate && <span>&mdash;</span>}
        <Picker
          key={formParams?.dateMax?.key}
          name={formParams?.dateMax?.name}
          defaultValue={formParams?.dateMax?.defaultValue}
          onChange={formParams?.dateMax?.onChange}
          precision={precision}
          hidden={!isMinMaxDate}
        />
        <label className={'flex h-full items-center justify-center rounded-md bg-accent p-2 text-sm'}>
          {isMinMaxDate ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          <input
            type={'checkbox'}
            defaultChecked={isMinMaxDate}
            onChange={(event) => setIsMinMaxDate(event.currentTarget.checked)}
            className={'hidden w-4 appearance-none'}
          />
        </label>
      </div>
      <AssetDatePrecisionCombobox
        key={formParams?.datePrecision?.key}
        name={formParams?.datePrecision?.name}
        defaultValue={precision}
        onChange={(precision) => {
          setPrecision(precision);
          const onChange = formParams?.datePrecision?.onChange;
          if (onChange) {
            onChange(precision);
          }
        }}
      />
    </div>
  );
}
