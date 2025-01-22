import { AssetDate, AssetDatePrecision } from '@/features/assets/assets.validation';
import React, { useMemo, useState } from 'react';
import { DATE_PRECISION_ARRAY } from '@/features/assets/assets.constants';
import { MONTHS_IN_POLISH } from '@/lib/constants';
import { getYYYYMMDD } from '@/utils/dates';

export interface AssetDatePrecisionComboboxProps {
  key?: string;
  name?: string;
  defaultValue?: AssetDatePrecision;
  onValueChange?: (precision: AssetDatePrecision) => void;
}

export function AssetDatePrecisionCombobox({
  key,
  name,
  defaultValue,
  onValueChange
}: AssetDatePrecisionComboboxProps) {
  return (
    <select
      key={key}
      name={name}
      defaultValue={defaultValue}
      onChange={(event) => onValueChange && onValueChange(event.currentTarget.value as AssetDatePrecision)}
    >
      {DATE_PRECISION_ARRAY.map((precision) => (
        <option
          key={precision}
          value={precision}
        >
          {precision}
        </option>
      ))}
    </select>
  );
}

export interface DatePickerProps {
  precision: AssetDatePrecision;
  key?: string;
  name?: string;
  defaultValue?: Date;
}

export function DatePicker({ precision, key, name, defaultValue }: DatePickerProps) {
  const [date, setDate] = useState<Date>(defaultValue || new Date());
  const [yearString, setYearString] = useState<string>(date.getFullYear().toString());
  // const [month, setMonth] = useState<number>(date.getMonth());
  // const [day, setDay] = useState<number>(date.getDate());

  return (
    <>
      <div>{date.toDateString()}</div>
      <div>{getYYYYMMDD(date)}</div>
      <input
        type={'date'}
        key={key}
        name={name}
        value={getYYYYMMDD(date)}
        onChange={(event) => setDate(new Date(event.currentTarget.value))}
        hidden={precision !== 'day'}
        aria-hidden={precision !== 'day'}
      />
      {['year', 'month'].includes(precision) && (
        <input
          type={'number'}
          maxLength={4}
          min={1800}
          max={new Date().getFullYear()}
          value={yearString}
          onChange={(event) => {
            const value = event.target.value;
            setYearString((prev) => value.length <= 4 ? value : prev);
            if (value.length === 4) {
              setDate((prev) => new Date(parseInt(event.target.value), prev.getMonth(), prev.getDate()));
            }
          }}
        />
      )}
      {precision === 'month' && (
        <select
          value={date.getMonth()}
          onChange={(event) =>
            setDate((prev) => new Date(prev.getFullYear(), parseInt(event.target.value), prev.getDate()))
          }
        >
          {MONTHS_IN_POLISH.map((value, index) => (
            <option
              key={index}
              value={index}
            >
              {value}
            </option>
          ))}
        </select>
      )}
    </>
  );
}

export interface AssetDatePickerProps {
  formParams: { [K in keyof AssetDate]?: { key?: string; name?: string; defaultValue?: AssetDate[K] } };
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
    <div>
      <AssetDatePrecisionCombobox
        key={formParams?.datePrecision?.key}
        name={formParams?.datePrecision?.name}
        defaultValue={precision}
        onValueChange={(precision) => setPrecision(precision)}
      />
      <DatePicker
        key={formParams?.dateMin?.key}
        name={formParams?.dateMin?.name}
        defaultValue={formParams?.dateMin?.defaultValue}
        precision={precision}
      />
      <input
        type={'checkbox'}
        defaultChecked={isMinMaxDate}
        onChange={(event) => setIsMinMaxDate(event.currentTarget.checked)}
      />
      {isMinMaxDate && <div>Druga data</div>}
      <div>{precision}</div>
    </div>
  );
}
