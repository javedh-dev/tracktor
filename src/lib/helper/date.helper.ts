import type { DateValue } from '@internationalized/date';
import { format, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { ar, cs, de, enUS, es, fi, fr, hi, hu, it, pt, ro, ru } from 'date-fns/locale';

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

/** Treat legacy unquoted Y year tokens as calendar years; preserve quoted literals. */
export const normalizeDateFormat = (dateFormat: string): string =>
  dateFormat.replace(/'(?:[^']|'')*'|Y+/g, (token) =>
    token.startsWith("'") ? token : token === 'YYY' ? 'yyyy' : token.toLowerCase()
  );

const getDateFnsLocale = (locale: string) => {
  switch (locale) {
    case 'ar':
      return ar;
    case 'cs':
      return cs;
    case 'de':
      return de;
    case 'es':
      return es;
    case 'fi':
      return fi;
    case 'fr':
      return fr;
    case 'hi':
      return hi;
    case 'hu':
      return hu;
    case 'it':
      return it;
    case 'pt-PT':
      return pt;
    case 'ro':
      return ro;
    case 'ru':
      return ru;
    case 'en':
      return enUS;
    default:
      return undefined;
  }
};

export const formatDate = (date: Date | string, config: FormatConfig): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  try {
    const zonedDate = formatInTimeZone(dateObj, config.timezone, 'yyyy-MM-dd HH:mm:ss');
    const parsedDate = parse(zonedDate, 'yyyy-MM-dd HH:mm:ss', new Date());
    return format(parsedDate, normalizeDateFormat(config.dateFormat), {
      locale: getDateFnsLocale(config.locale)
    });
  } catch (e) {
    return '';
  }
};

export const formatDateForCalendar = (date: DateValue, config: FormatConfig): string => {
  const dateObj = date.toDate(config.timezone);
  return format(dateObj, normalizeDateFormat(config.dateFormat), {
    locale: getDateFnsLocale(config.locale)
  });
};

export const parseDate = (date: string, config: FormatConfig) => {
  const parsedDate = parse(date, normalizeDateFormat(config.dateFormat), new Date());
  return fromZonedTime(parsedDate, config.timezone);
};

export const isValidFormat = (fmt: string): { ex?: string; valid: boolean } => {
  try {
    return {
      ex: format(new Date(), normalizeDateFormat(fmt)),
      valid: true
    };
  } catch (_) {
    return { valid: false };
  }
};

export const parseWithFormat = (dateStr: string, fmt: string): Date | null => {
  try {
    const parsed = parse(dateStr, normalizeDateFormat(fmt), new Date());
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (_) {
    return null;
  }
};
