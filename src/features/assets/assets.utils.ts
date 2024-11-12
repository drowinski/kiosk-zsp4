import { AssetDatePrecision } from '@/features/assets/assets.validation';

export const DATE_TIME_LOCALE = 'pl-PL';

interface DateFormatter {
  format(date: Date): string
  formatRange(startDate: Date, endDate: Date): string
}

const dateFormatters: Record<AssetDatePrecision, DateFormatter> = {
  day: new Intl.DateTimeFormat(DATE_TIME_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  month: new Intl.DateTimeFormat(DATE_TIME_LOCALE, {
    year: 'numeric',
    month: 'long'
  }),
  year: new Intl.DateTimeFormat(DATE_TIME_LOCALE, {
    year: 'numeric'
  }),
  decade: {
    format(date: Date) {
      const year = date.getFullYear().toString();
      if (year.startsWith('19')) {
        return 'lata ' + year.at(-2) + '0';
      } else {
        return 'lata ' + year.slice(0, 2) + '00';
      }
    },
    formatRange(startDate: Date, endDate: Date): string {
      const startDecade = this.format(startDate);
      const endDecade = this.format(endDate);
      if (startDecade === endDecade) {
        return startDecade;
      }
      return `${startDecade} - ${endDecade}`;
    }
  },
  century: {
    format() {
      return 'Formatowanie wieku jeszcze nie jest wspierane.';
    },
    formatRange(): string {
      return 'Formatowanie wieku jeszcze nie jest wspierane.';
    }
  }
};

export function formatDate({
  dateMin,
  dateMax,
  datePrecision,
  dateIsRange
}: {
  dateMin: Date;
  dateMax: Date;
  datePrecision: AssetDatePrecision;
  dateIsRange?: boolean;
}): string {
  const formatter = dateFormatters[datePrecision];
  let formattedString: string;
  if (dateMin !== dateMax) {
    formattedString = formatter.formatRange(dateMin, dateMax);
  } else {
    formattedString = formatter.format(dateMin);
  }
  return formattedString;
}
