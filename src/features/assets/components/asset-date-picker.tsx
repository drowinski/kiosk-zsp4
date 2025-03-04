import { AssetDatePrecision, UpdatedAssetDate } from '@/features/assets/assets.validation';
import { Select, SelectContent, SelectOption, SelectTrigger } from '@/components/base/select';
import { DATE_PRECISION_ARRAY, DATE_PRECISION_ARRAY_IN_POLISH, MONTHS_IN_POLISH } from '@/lib/constants';
import { Fragment, useEffect, useState } from 'react';
import { Input } from '@/components/base/input';
import { cn } from '@/utils/styles';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@/components/icons';
import { Button } from '@/components/base/button';
import { Label } from '@/components/base/label';

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
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  precision?: AssetDatePrecision;
  hidden?: boolean;
  ariaLabel?: string;
}

export function DatePicker({
  name,
  value,
  defaultValue,
  onValueChange,
  precision = 'day',
  hidden = false,
  ariaLabel
}: DatePickerProps) {
  const [date, setDate] = useState<string>(defaultValue ?? value ?? '');
  const [normalizedDate, setNormalizedDate] = useState<string>(date);

  if (value !== undefined && value !== date) {
    setDate(value);
  }

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

  useEffect(() => {
    if (precision === 'day') {
      setNormalizedDate(date);
      return;
    }
    const splitDate = date.split('-');
    if (splitDate.length !== 3) {
      setNormalizedDate(date);
      return;
    }

    const [year, month, _] = splitDate;
    let newNormalizedDate = '';
    if (precision === 'year') {
      newNormalizedDate = `${year}-01-01`;
    } else if (precision === 'month') {
      newNormalizedDate = `${year}-${month}-01`;
    }
    setNormalizedDate(newNormalizedDate);
  }, [date, precision]);

  const ConditionalDiv = precision === 'year' ? Fragment : 'div';

  return (
    <div
      hidden={hidden}
      aria-hidden={hidden}
    >
      <input
        name={name}
        type={'date'}
        value={normalizedDate}
        readOnly
        hidden
        aria-hidden
      />
      {precision === 'day' && (
        <Input
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
          aria-label={ariaLabel}
        />
      )}
      <ConditionalDiv {...(ConditionalDiv === 'div' ? { className: 'flex flex-nowrap' } : undefined)}>
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
              aria-label={ariaLabel ? ariaLabel + ' (miesiąc)' : undefined}
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
        {(precision === 'year' || precision === 'month') && (
          <Input
            type={'number'}
            placeholder={'rok'}
            aria-label={ariaLabel ? ariaLabel + ' (rok)' : undefined}
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
      </ConditionalDiv>
    </div>
  );
}

type StringifiedUpdatedAssetDate = Omit<Omit<Omit<UpdatedAssetDate, 'dateMin'>, 'dateMax'>, 'id'> & {
  id: string;
  dateMin: string;
  dateMax: string;
};

type AssetDatePickerProp<K extends keyof StringifiedUpdatedAssetDate> = {
  name?: string;
  defaultValue?: StringifiedUpdatedAssetDate[K];
  value?: StringifiedUpdatedAssetDate[K];
  onValueChange?: (value: StringifiedUpdatedAssetDate[K]) => void;
};

export interface AssetDatePickerProps {
  id?: Omit<Omit<AssetDatePickerProp<'id'>, 'onValueChange'>, 'defaultValue'>;
  dateMin?: AssetDatePickerProp<'dateMin'>;
  dateMax?: AssetDatePickerProp<'dateMax'>;
  datePrecision?: AssetDatePickerProp<'datePrecision'>;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function AssetDatePicker({
  id,
  dateMin,
  dateMax,
  datePrecision,
  enabled = false,
  onEnabledChange,
  orientation = 'horizontal'
}: AssetDatePickerProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(enabled);
  const [precision, setPrecision] = useState<AssetDatePrecision>(
    datePrecision?.defaultValue || datePrecision?.value || 'day'
  );
  const [isRange, setIsRange] = useState<boolean>(
    (dateMin?.defaultValue !== undefined &&
      dateMax?.defaultValue !== undefined &&
      dateMin.defaultValue !== dateMax.defaultValue) ||
      (dateMin?.value !== undefined && dateMax?.value !== undefined && dateMin.value !== dateMax.value)
  );
  const [minDate, setMinDate] = useState<string>(dateMin?.defaultValue || dateMin?.value || '');
  const [maxDate, setMaxDate] = useState<string>(dateMax?.defaultValue || dateMax?.value || '');
  const [latestMaxDate, setLatestMaxDate] = useState<string>(maxDate);

  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    if (!datePrecision?.value) return;
    setPrecision(datePrecision.value);
  }, [datePrecision?.value]);

  const toggleIsRange = () => {
    if (!isRange) {
      setMaxDate(latestMaxDate);
      dateMax?.onValueChange?.(latestMaxDate);
      setIsRange(true);
    } else {
      setLatestMaxDate(maxDate);
      setIsRange(false);
      setMaxDate(minDate);
      dateMax?.onValueChange?.(minDate);
    }
  };

  return (
    <>
      {isEnabled ? (
        <div className={'flex flex-col gap-1'}>
          <div className={cn('flex items-center gap-1', orientation === 'vertical' && 'w-fit flex-col')}>
            {id && (
              <input
                type={'hidden'}
                name={id.name}
                value={id.value}
                readOnly
              />
            )}
            <DatePicker
              name={dateMin?.name}
              value={minDate}
              onValueChange={(value) => {
                setMinDate(value);
                dateMin?.onValueChange?.(value);
                if (!isRange) {
                  setMaxDate(value);
                  dateMax?.onValueChange?.(value);
                }
              }}
              precision={precision}
              ariaLabel={isRange ? 'data minimalna okresu' : 'data'}
            />
            {isRange && <span>&ndash;</span>}
            <DatePicker
              name={dateMax?.name}
              value={maxDate}
              onValueChange={(value) => {
                setMaxDate(value);
                dateMax?.onValueChange?.(value);
              }}
              precision={precision}
              hidden={!isRange}
              ariaLabel={'data maksymalna okresu'}
            />
            <div
              role={'checkbox'}
              aria-checked={isRange}
              tabIndex={0}
              onClick={toggleIsRange}
              onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && toggleIsRange()}
              className={cn(
                'flex h-full items-center justify-center rounded-xl bg-accent p-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                orientation === 'vertical' && 'h-fit w-full flex-col'
              )}
            >
              {orientation === 'horizontal' && (isRange ? <ChevronLeftIcon /> : <ChevronRightIcon />)}
              {orientation === 'vertical' && (isRange ? <ChevronUpIcon /> : <ChevronDownIcon />)}
            </div>
          </div>
          <Label variant={'horizontal'}>
            Precyzja daty:
            <AssetDatePrecisionCombobox
              name={datePrecision?.name}
              value={precision}
              onValueChange={(value) => {
                setPrecision(value);
                datePrecision?.onValueChange?.(value);
              }}
            />
          </Label>
          <Button
            className={'w-fit'}
            onClick={() => {
              setIsEnabled(false);
              onEnabledChange?.(false);
            }}
          >
            Usuń datę
          </Button>
        </div>
      ) : (
        <Button
          variant={'secondary'}
          className={'w-fit'}
          onClick={() => {
            setIsEnabled(true);
            onEnabledChange?.(true);
          }}
        >
          Dodaj datę
        </Button>
      )}
    </>
  );
}
