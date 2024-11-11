import React from 'react';
import { DATE_PRECISION_ARRAY } from '@/lib/constants';
import { Input } from '@/components/base/input';

interface BaseDatePickerProps {
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
  onInput?: (date?: Date) => void;
  className?: string;
}

export const YearPicker = React.forwardRef<HTMLInputElement, BaseDatePickerProps>(
  ({ name, defaultValue, disabled, onInput, className }, ref) => {
    const _onInput = (event: React.FormEvent<HTMLInputElement>) => {
      if (!onInput) return;
      const value = Number(event.currentTarget.value);
      if (!value || Number.isNaN(value) || !Number.isInteger(value)) return undefined;
      const date = new Date(2000, 0);
      date.setFullYear(value);
      onInput(date);
    };
    return (
      <Input
        ref={ref}
        type={'number'}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        onInput={_onInput}
        className={className}
      ></Input>
    );
  }
);
YearPicker.displayName = 'YearPicker';

export const MonthPicker = React.forwardRef<HTMLInputElement, BaseDatePickerProps>(
  ({ name, defaultValue, disabled, onInput, className }, ref) => {
    const _onInput = (event: React.FormEvent<HTMLInputElement>) => {
      if (!onInput) return;
      const value = Number(event.currentTarget.value);
      if (!value || Number.isNaN(value) || !Number.isInteger(value) || value > 12 || value < 1) return undefined;
      const date = new Date(2000, value + 1);
      date.setFullYear(value);
      onInput(date);
    };
    return (
      <Input
        ref={ref}
        type={'date'}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        onInput={_onInput}
        className={className}
        hidden
      />
    );
  }
);
MonthPicker.displayName = 'MonthPicker';

interface DatePickerProps extends BaseDatePickerProps {
  datePrecision: (typeof DATE_PRECISION_ARRAY)[number];
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(({ datePrecision, ...props }, ref) => {
  const componentMap = new Map<typeof datePrecision, React.JSX.Element>();
  componentMap.set(
    'year',
    <YearPicker
      ref={ref}
      {...props}
    />
  );
  return componentMap.get(datePrecision) ?? <div>Unimplemented</div>;
});
DatePicker.displayName = 'DatePicker';
