import type { DateValue } from '@internationalized/date';
import { format, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { es, fr, de, hi } from 'date-fns/locale';

export interface FormatConfig {
  dateFormat: string;
  timezone: string;
  locale: string;
  currency: string;
  unitOfVolume: string;
  unitOfLpg: string;
  unitOfCng: string;
  unitOfDistance: string;
  mileageUnitFormat: string;
}

const getDateFnsLocale = (locale: string) => {
  switch (locale) {
    case 'es':
      return es;
    case 'fr':
      return fr;
    case 'de':
      return de;
    case 'hi':
      return hi;
    case 'en':
    default:
      return undefined;
  }
};

export const formatDate = (date: Date | string, config: FormatConfig): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  try {
    const zonedDate = formatInTimeZone(dateObj, config.timezone, 'yyyy-MM-dd HH:mm:ss');
    const parsedDate = parse(zonedDate, 'yyyy-MM-dd HH:mm:ss', new Date());
    return format(parsedDate, config.dateFormat, {
      locale: getDateFnsLocale(config.locale)
    });
  } catch (e) {
    return '';
  }
};

export const formatDateForCalendar = (date: DateValue, config: FormatConfig): string => {
  const dateObj = date.toDate(config.timezone);
  return format(dateObj, config.dateFormat, { locale: getDateFnsLocale(config.locale) });
};

export const parseDate = (date: string, config: FormatConfig) => {
  const parsedDate = parse(date, config.dateFormat, new Date());
  return fromZonedTime(parsedDate, config.timezone);
};

export const isValidFormat = (fmt: string): { ex?: string; valid: boolean } => {
  try {
    return {
      ex: format(new Date(), fmt),
      valid: true
    };
  } catch (_) {
    return { valid: false };
  }
};

export const parseWithFormat = (dateStr: string, fmt: string): Date | null => {
  try {
    const parsed = parse(dateStr, fmt, new Date());
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (_) {
    return null;
  }
};
